import { orderDatabase } from "./database-server";
import type { ValidatedOrderLine } from "./live-order";

export type PendingOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  lines: ValidatedOrderLine[];
  subtotalCents: number;
  deliveryFeeCents: number;
  uberQuoteId: string;
  uberQuoteExpiresAt: Date;
};

/** Create a durable pending order before opening Stripe Checkout. */
export async function createPendingOrder(input: PendingOrderInput): Promise<string> {
  const sql = orderDatabase();
  const rows = await sql`
    insert into direct_orders (
      customer_name, customer_email, customer_phone,
      delivery_address, delivery_instructions, cart,
      subtotal_cents, delivery_fee_cents, uber_quote_id, uber_quote_expires_at
    ) values (
      ${input.customerName}, ${input.customerEmail}, ${input.customerPhone},
      ${input.deliveryAddress}, ${input.deliveryInstructions}, ${JSON.stringify(input.lines)}::jsonb,
      ${input.subtotalCents}, ${input.deliveryFeeCents}, ${input.uberQuoteId}, ${input.uberQuoteExpiresAt.toISOString()}
    ) returning id
  `;
  const id: unknown = rows[0]?.id;
  if (typeof id !== "string") throw new Error("Could not create the pending order.");
  return id;
}

/** Checkout URL must not reach the customer unless its session ID is saved. */
export async function attachCheckoutSession(orderId: string, sessionId: string): Promise<void> {
  const sql = orderDatabase();
  const rows = await sql`
    update direct_orders
    set stripe_checkout_session_id = ${sessionId}, updated_at = now()
    where id = ${orderId}::uuid
      and status = 'pending_payment'
      and stripe_checkout_session_id is null
    returning id
  `;
  if (!rows.length) throw new Error("Could not attach the Stripe Checkout session.");
}

export async function expirePendingOrder(orderId: string): Promise<void> {
  const sql = orderDatabase();
  await sql`
    update direct_orders
    set status = 'payment_expired', updated_at = now()
    where id = ${orderId}::uuid and status = 'pending_payment'
  `;
}
