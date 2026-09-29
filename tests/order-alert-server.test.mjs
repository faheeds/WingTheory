import assert from "node:assert/strict";
import test from "node:test";
import { OrderAlertError, sendPaidOrderAlert } from "../src/lib/order-alert-server.ts";

const order = {
  orderId: "9d4a23d1-0e8f-40cf-a9bc-174f68ec3912",
  customerName: "Taylor Example",
  customerPhone: "2065550100",
  deliveryAddress: "123 Example St, Seattle, WA 98102",
  deliveryInstructions: "Side door",
  lines: [{
    itemId: "sf", name: "Seasoned Fries", quantity: 2, unitPriceCents: 449,
    pieces: null, chicken: null, sauces: [], crispiness: null,
    sauceLevel: null, dips: [], instructions: "",
  }],
  totalCents: 1598,
};

test("paid order alert uses the staff inbox and stable retry key", async () => {
  let call;
  const request = async (url, options) => {
    call = { url, options };
    return new Response(JSON.stringify({ id: "email_123" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const id = await sendPaidOrderAlert(order, "re_test_key", request);
  assert.equal(id, "email_123");
  assert.equal(call.url, "https://api.resend.com/emails");
  assert.equal(call.options.headers["Idempotency-Key"], `paid-order/${order.orderId}`);
  const body = JSON.parse(call.options.body);
  assert.deepEqual(body.to, ["support@wing-theory.com"]);
  assert.match(body.text, /2 × Seasoned Fries/);
  assert.match(body.text, /Side door/);
});

test("paid order alert fails closed without a key or valid order", async () => {
  await assert.rejects(() => sendPaidOrderAlert(order, ""), OrderAlertError);
  await assert.rejects(
    () => sendPaidOrderAlert({ ...order, orderId: "bad" }, "re_test_key"),
    OrderAlertError,
  );
});

test("provider errors do not expose provider response bodies", async () => {
  const request = async () => new Response("private details", { status: 403 });
  await assert.rejects(
    () => sendPaidOrderAlert(order, "re_test_key", request),
    (error) => error instanceof OrderAlertError && !error.message.includes("private details"),
  );
});
