import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripeCheckoutAvailable } from "@/lib/checkout-availability";
import { orderDatabase } from "@/lib/database-server";
import { verifyStripeWebhook } from "@/lib/payment-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!stripeCheckoutAvailable()) {
    return NextResponse.json({ error: "Stripe test checkout is closed." }, { status: 503 });
  }
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signingSecret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }
  let event: Stripe.Event;
  try {
    event = verifyStripeWebhook(await request.text(), request.headers.get("stripe-signature"), signingSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    const sql = orderDatabase();
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = typeof session.client_reference_id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.client_reference_id)
      ? session.client_reference_id : null;
    const rows = await sql`
      insert into stripe_webhook_events (id, event_type, order_id)
      values (${event.id}, ${event.type}, ${orderId}::uuid)
      on conflict (id) do update set id = excluded.id
      returning processed_at
    `;
    if (rows[0]?.processed_at) return NextResponse.json({ received: true });

    if (event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded") {
      if (session.payment_status === "paid" && orderId &&
          Number.isInteger(session.amount_total) &&
          Number.isInteger(session.total_details?.amount_tax)) {
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent : session.payment_intent?.id ?? null;
        const updated = await sql`
          update direct_orders
          set status = 'paid',
              stripe_payment_intent_id = ${paymentIntentId},
              tax_cents = ${session.total_details?.amount_tax ?? 0},
              total_cents = ${session.amount_total},
              updated_at = now()
          where id = ${orderId}::uuid
            and stripe_checkout_session_id = ${session.id}
            and status = 'pending_payment'
          returning id
        `;
        if (!updated.length) {
          const existing = await sql`
            select id from direct_orders
            where id = ${orderId}::uuid and stripe_checkout_session_id = ${session.id} and status = 'paid'
          `;
          if (!existing.length) throw new Error("Paid checkout did not match a pending order.");
        }
      }
    } else if (event.type === "checkout.session.expired" && orderId) {
      await sql`
        update direct_orders set status = 'payment_expired', updated_at = now()
        where id = ${orderId}::uuid and stripe_checkout_session_id = ${session.id}
          and status = 'pending_payment'
      `;
    } else if (event.type === "checkout.session.async_payment_failed" && orderId) {
      await sql`
        update direct_orders set status = 'payment_failed', updated_at = now()
        where id = ${orderId}::uuid and stripe_checkout_session_id = ${session.id}
          and status = 'pending_payment'
      `;
    }
    await sql`
      update stripe_webhook_events set processed_at = now(), error = null
      where id = ${event.id}
    `;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe test webhook could not be processed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
