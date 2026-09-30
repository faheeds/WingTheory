import assert from "node:assert/strict";
import test from "node:test";
import {
  displayAddress,
  InvalidCheckoutError,
  parseDeliveryCheckoutInput,
  uberAddress,
} from "../src/lib/checkout-input.ts";
import { stripeCheckoutAvailable } from "../src/lib/checkout-availability.ts";

const valid = {
  cart: [{ itemId: "sf", quantity: 1 }],
  name: "Customer", email: "customer@example.com", phone: "(206) 555-0123",
  street: "123 Broadway E", apartment: "Unit 4", city: "Seattle",
  state: "wa", postalCode: "98102", instructions: "Leave at door",
};

test("delivery details are normalized for Stripe and Uber", () => {
  const input = parseDeliveryCheckoutInput(valid);
  assert.equal(input.state, "WA");
  assert.equal(displayAddress(input), "123 Broadway E, Unit 4, Seattle, WA 98102");
  assert.deepEqual(JSON.parse(uberAddress(input)), {
    street_address: ["123 Broadway E"], city: "Seattle", state: "WA",
    zip_code: "98102", country: "US",
  });
});

test("checkout rejects incomplete or out of state delivery details", () => {
  for (const change of [
    { email: "invalid" }, { phone: "123" }, { state: "OR" },
    { postalCode: "bad" }, { instructions: "x".repeat(501) },
  ]) {
    assert.throws(() => parseDeliveryCheckoutInput({ ...valid, ...change }), InvalidCheckoutError);
  }
});

test("test checkout stays closed in production and without both switches", () => {
  const previous = {
    vercel: process.env.VERCEL_ENV,
    publicMode: process.env.NEXT_PUBLIC_CHECKOUT_MODE,
    testMode: process.env.STRIPE_CHECKOUT_TEST_MODE,
  };
  try {
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_CHECKOUT_MODE = "stripe_test";
    process.env.STRIPE_CHECKOUT_TEST_MODE = "enabled";
    assert.equal(stripeCheckoutAvailable(), false);
    process.env.VERCEL_ENV = "preview";
    assert.equal(stripeCheckoutAvailable(), true);
    process.env.STRIPE_CHECKOUT_TEST_MODE = "disabled";
    assert.equal(stripeCheckoutAvailable(), false);
  } finally {
    if (previous.vercel === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous.vercel;
    if (previous.publicMode === undefined) delete process.env.NEXT_PUBLIC_CHECKOUT_MODE;
    else process.env.NEXT_PUBLIC_CHECKOUT_MODE = previous.publicMode;
    if (previous.testMode === undefined) delete process.env.STRIPE_CHECKOUT_TEST_MODE;
    else process.env.STRIPE_CHECKOUT_TEST_MODE = previous.testMode;
  }
});
