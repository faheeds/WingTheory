import assert from "node:assert/strict";
import test from "node:test";
import { InvalidCartError, validateCart } from "../src/lib/live-order.ts";

test("server recalculates a side from menu price", () => {
  const result = validateCart([{ itemId: "sf", quantity: 2, unitPrice: 0.01 }]);
  assert.equal(result.subtotalCents, 898);
  assert.deepEqual(result.manifestItems, [{ name: "Seasoned Fries", quantity: 2 }]);
});

test("server recalculates wing count, crispiness and dips", () => {
  const result = validateCart([{
    itemId: "hh", quantity: 1, pieces: 15, chicken: "Bone-In",
    sauces: ["Hot Honey Wings", "Korean Fire Wings"],
    crispiness: "Extra Crispy", sauceLevel: "Regular", dips: ["Ranch", "Blue Cheese"],
    unitPrice: 0,
  }]);
  assert.equal(result.subtotalCents, 2999);
});

test("side cannot be given wing-only options", () => {
  assert.throws(
    () => validateCart([{ itemId: "sf", quantity: 1, pieces: 6 }]),
    InvalidCartError,
  );
});

test("unknown and malformed cart contents fail closed", () => {
  assert.throws(() => validateCart([{ itemId: "missing", quantity: 1 }]), InvalidCartError);
  assert.throws(() => validateCart([{ itemId: "sf", quantity: 0 }]), InvalidCartError);
  assert.throws(() => validateCart([{ itemId: "sf", quantity: 1, instructions: "x".repeat(141) }]), InvalidCartError);
  assert.throws(() => validateCart([]), InvalidCartError);
});

test("wing modifiers must match the menu rules", () => {
  const base = {
    itemId: "hh", quantity: 1, pieces: 6, chicken: "Bone-In",
    sauces: ["Hot Honey Wings"], crispiness: "Classic", sauceLevel: "Regular", dips: [],
  };
  assert.throws(() => validateCart([{ ...base, sauces: [] }]), InvalidCartError);
  assert.throws(() => validateCart([{ ...base, sauces: ["Hot Honey Wings", "Korean Fire Wings"] }]), InvalidCartError);
  assert.throws(() => validateCart([{ ...base, dips: ["Ranch", "Ranch"] }]), InvalidCartError);
  assert.throws(() => validateCart([{ ...base, chicken: "Unicorn" }]), InvalidCartError);
});
