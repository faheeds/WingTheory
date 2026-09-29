import assert from "node:assert/strict";
import test from "node:test";
import Stripe from "stripe";
import {
  PaymentConfigurationError,
  stripeKeyMode,
  verifyStripeWebhook,
} from "../src/lib/payment-server.ts";

test("only a secret or restricted Stripe key is accepted", () => {
  assert.equal(stripeKeyMode("rk_live_example"), "live");
  assert.equal(stripeKeyMode("sk_test_example"), "test");
  assert.throws(() => stripeKeyMode("pk_live_example"), PaymentConfigurationError);
  assert.throws(() => stripeKeyMode("something-else"), PaymentConfigurationError);
});

test("webhook signature is checked against the raw body", () => {
  const payload = JSON.stringify({ id: "evt_example", object: "event", type: "checkout.session.completed" });
  const signingSecret = "whsec_example";
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret: signingSecret });
  assert.equal(verifyStripeWebhook(payload, signature, signingSecret).id, "evt_example");
  assert.throws(() => verifyStripeWebhook(`${payload} `, signature, signingSecret));
  assert.throws(() => verifyStripeWebhook(payload, null, signingSecret), PaymentConfigurationError);
});
