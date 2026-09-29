import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { UberDirectClient, UberDirectError, verifyUberDirectWebhook } from "../src/lib/uber-direct.ts";

const config = { clientId: "client", clientSecret: "secret", customerId: "customer" };

test("webhook verification uses the unmodified body and a timing-safe digest", () => {
  const raw = '{"name":"\\u0026"}';
  const signature = createHmac("sha256", "signing-key").update(raw).digest("hex");
  assert.equal(verifyUberDirectWebhook(raw, signature, "signing-key"), true);
  assert.equal(verifyUberDirectWebhook('{"name":"&"}', signature, "signing-key"), false);
  assert.equal(verifyUberDirectWebhook(raw, "bad", "signing-key"), false);
  assert.equal(verifyUberDirectWebhook(raw, signature, ""), false);
});

test("quotes use OAuth, cache its token, and preserve Uber's fee in cents", async () => {
  const calls = [];
  const request = async (url, options) => {
    calls.push({ url, options });
    if (url.includes("oauth")) return Response.json({ access_token: "token", expires_in: 3600 });
    return Response.json({ id: "dqt_1", expires: "2026-09-29T12:15:00Z", fee: 558, currency: "usd", duration: 44 });
  };
  const client = new UberDirectClient(config, request, () => 0);
  const quote = await client.createQuote("pickup", "dropoff");
  await client.createQuote("pickup", "dropoff");
  assert.equal(quote.feeCents, 558);
  assert.equal(calls.filter(({ url }) => url.includes("oauth")).length, 1);
  assert.equal(calls[1].options.headers.Authorization, "Bearer token");
  assert.deepEqual(JSON.parse(calls[1].options.body), { pickup_address: "pickup", dropoff_address: "dropoff" });
});

test("API errors do not expose provider response bodies or credentials", async () => {
  const request = async () => new Response('secret details', { status: 401 });
  const client = new UberDirectClient(config, request);
  await assert.rejects(() => client.createQuote("pickup", "dropoff"), (error) => {
    assert.ok(error instanceof UberDirectError);
    assert.equal(error.status, 401);
    assert.equal(error.message.includes("secret"), false);
    return true;
  });
});

test("dispatch requires an order reference and valid manifest", async () => {
  const client = new UberDirectClient(config, async () => { throw new Error("should not call Uber"); });
  await assert.rejects(() => client.createDelivery({ quoteId: "", externalId: "", manifestItems: [] }), /required/);
});

test("dispatch sends the paid order reference and returns the tracking link", async () => {
  const calls = [];
  const request = async (url, options) => {
    calls.push({ url, options });
    if (url.includes("oauth")) return Response.json({ access_token: "token", expires_in: 3600 });
    return Response.json({ id: "del_1", status: "pending", live_mode: false, tracking_url: "https://example.com/tracking" });
  };
  const client = new UberDirectClient(config, request);
  const delivery = await client.createDelivery({
    quoteId: "dqt_1",
    externalId: "WT-123",
    pickupAddress: "pickup",
    pickupName: "Wing Theory",
    pickupPhoneNumber: "4255186536",
    dropoffAddress: "dropoff",
    dropoffName: "Customer",
    dropoffPhoneNumber: "2065550100",
    manifestItems: [{ name: "Wings", quantity: 1 }],
  });
  assert.deepEqual(delivery, {
    id: "del_1",
    status: "pending",
    liveMode: false,
    trackingUrl: "https://example.com/tracking",
  });
  assert.equal(JSON.parse(calls[1].options.body).external_id, "WT-123");
});
