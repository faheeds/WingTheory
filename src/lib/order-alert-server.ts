import type { ValidatedOrderLine } from "./live-order";

export type PaidOrderAlert = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  lines: ValidatedOrderLine[];
  totalCents: number;
};

export class OrderAlertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAlertError";
  }
}

function formatAlert(order: PaidOrderAlert): string {
  const lines = order.lines.map((line) => {
    const options = [
      line.pieces === null ? null : `${line.pieces} pieces`,
      line.chicken,
      line.sauces.length ? line.sauces.join(" + ") : null,
      line.crispiness,
      line.sauceLevel,
      line.dips.length ? `Dips: ${line.dips.join(" + ")}` : null,
      line.instructions ? `Note: ${line.instructions}` : null,
    ].filter(Boolean);
    return `${line.quantity} × ${line.name}${options.length ? ` (${options.join(", ")})` : ""}`;
  });

  return [
    `Paid Wing Theory order ${order.orderId}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Deliver to: ${order.deliveryAddress}`,
    order.deliveryInstructions ? `Delivery notes: ${order.deliveryInstructions}` : "",
    "",
    "Items:",
    ...lines,
    "",
    `Customer total: $${(order.totalCents / 100).toFixed(2)}`,
    "Check the secured operator dashboard for payment and courier status before preparing or dispatching.",
  ].filter((line) => line !== "").join("\n");
}

/** Send one staff alert for a verified paid order. Never call this from browser code. */
export async function sendPaidOrderAlert(
  order: PaidOrderAlert,
  apiKey = process.env.RESEND_API_KEY,
  request: typeof fetch = fetch,
): Promise<string> {
  if (!apiKey || !apiKey.startsWith("re_")) {
    throw new OrderAlertError("Resend is not configured.");
  }
  if (!/^[0-9a-f-]{36}$/i.test(order.orderId) || !order.lines.length) {
    throw new OrderAlertError("The paid order alert is invalid.");
  }
  const response = await request("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `paid-order/${order.orderId}`,
    },
    body: JSON.stringify({
      from: "Wing Theory Orders <orders@wing-theory.com>",
      to: ["support@wing-theory.com"],
      subject: `Paid Wing Theory order ${order.orderId.slice(0, 8).toUpperCase()}`,
      text: formatAlert(order),
    }),
  });
  if (!response.ok) {
    throw new OrderAlertError(`Resend rejected the order alert (${response.status}).`);
  }
  const result: unknown = await response.json();
  if (typeof result !== "object" || result === null || !("id" in result) || typeof result.id !== "string") {
    throw new OrderAlertError("Resend returned an invalid email receipt.");
  }
  return result.id;
}
