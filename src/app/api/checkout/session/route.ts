import { NextResponse } from "next/server";
import { stripeCheckoutAvailable } from "@/lib/checkout-availability";
import { displayAddress, InvalidCheckoutError, parseDeliveryCheckoutInput, uberAddress } from "@/lib/checkout-input";
import { InvalidCartError, validateCart } from "@/lib/live-order";
import { attachCheckoutSession, createPendingOrder, expirePendingOrder } from "@/lib/order-repository";
import { stripeClient } from "@/lib/payment-server";
import { UberDirectClient } from "@/lib/uber-direct";

export const runtime = "nodejs";

const pickupAddress = uberAddress({
  street: "515 Broadway E", city: "Seattle", state: "WA", postalCode: "98102",
});

export async function POST(request: Request) {
  if (!stripeCheckoutAvailable()) {
    return NextResponse.json({ error: "Online payment is not available yet." }, { status: 503 });
  }
  if (!process.env.STRIPE_SECRET_KEY || !/^(sk|rk)_test_\S+$/.test(process.env.STRIPE_SECRET_KEY)) {
    return NextResponse.json({ error: "Test checkout is not configured." }, { status: 503 });
  }

  let orderId: string | null = null;
  try {
    const input = parseDeliveryCheckoutInput(await request.json());
    const cart = validateCart(input.cart);
    const uber = new UberDirectClient({
      clientId: process.env.UBER_DIRECT_CLIENT_ID ?? "",
      clientSecret: process.env.UBER_DIRECT_CLIENT_SECRET ?? "",
      customerId: process.env.UBER_DIRECT_CUSTOMER_ID ?? "",
    });
    const quote = await uber.createQuote(pickupAddress, uberAddress(input));
    const quoteExpiresAt = new Date(quote.expires);
    if (quote.currency.toUpperCase() !== "USD" ||
        Number.isNaN(quoteExpiresAt.getTime()) ||
        quoteExpiresAt.getTime() < Date.now() + 5 * 60_000) {
      throw new Error("Delivery is temporarily unavailable. Please try again.");
    }
    orderId = await createPendingOrder({
      customerName: input.name,
      customerEmail: input.email,
      customerPhone: input.phone,
      deliveryAddress: displayAddress(input),
      deliveryInstructions: input.instructions,
      lines: cart.lines,
      subtotalCents: cart.subtotalCents,
      deliveryFeeCents: quote.feeCents,
      uberQuoteId: quote.id,
      uberQuoteExpiresAt: quoteExpiresAt,
    });
    const stripe = stripeClient();
    const customer = await stripe.customers.create({
      email: input.email,
      name: input.name,
      phone: input.phone,
      shipping: {
        name: input.name,
        phone: input.phone,
        address: {
          line1: input.street,
          line2: input.apartment || undefined,
          city: input.city,
          state: input.state,
          postal_code: input.postalCode,
          country: "US",
        },
      },
    });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl || !/^https?:\/\//.test(siteUrl)) {
      throw new Error("Checkout return URL is not configured.");
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customer.id,
      client_reference_id: orderId,
      metadata: { order_id: orderId, uber_quote_id: quote.id },
      payment_intent_data: { metadata: { order_id: orderId } },
      automatic_tax: { enabled: true },
      line_items: cart.lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.unitPriceCents,
          product_data: {
            name: line.name,
            description: [
              line.pieces ? `${line.pieces} pieces` : null,
              line.chicken,
              line.sauces.length ? line.sauces.join(" + ") : null,
              line.crispiness,
              line.dips.length ? `Dips: ${line.dips.join(", ")}` : null,
              line.instructions || null,
            ].filter(Boolean).join(" · ") || undefined,
          },
        },
      })),
      shipping_options: [{
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: quote.feeCents, currency: "usd" },
          display_name: "Delivery",
        },
      }],
      success_url: `${siteUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?canceled=1`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout page.");
    try {
      await attachCheckoutSession(orderId, session.id);
    } catch (error) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      throw error;
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (orderId) {
      await expirePendingOrder(orderId).catch(() => undefined);
    }
    if (error instanceof InvalidCheckoutError || error instanceof InvalidCartError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Test checkout could not start:", error);
    return NextResponse.json({ error: "Checkout could not start. Please try again." }, { status: 503 });
  }
}
