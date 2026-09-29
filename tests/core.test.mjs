import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  categories,
  checkoutTotals,
  isWingItem,
  itemImages,
  itemPath,
  items,
  priceForItem,
} from "../src/lib/data.ts";
import {
  canRequestCancellation,
  nextOrderStatus,
  trackingStage,
} from "../src/lib/order-machine.ts";

test("menu price equals the initial product price", () => {
  const item = items[0];
  assert.equal(priceForItem(item, 6), item.price);
  assert.equal(priceForItem(item, 15), 26.49);
  assert.equal(priceForItem(item, 15, true, 2), 29.99);
  assert.throws(() => priceForItem(item, 7), /Unsupported quantity/);
});

test("sides are fixed-price items without wing customization", () => {
  const fries = items.find((item) => item.id === "sf");
  assert.equal(isWingItem(fries), false);
  assert.equal(priceForItem(fries, 30, true, 2), fries.price);
  assert.equal(isWingItem(items[0]), true);
});

test("every menu category has products, photos, and distinct product routes", () => {
  const paths = new Set();
  for (const category of categories.filter((value) => value !== "All")) {
    assert.ok(items.some((item) => item.category === category), category);
  }
  for (const item of items) {
    assert.ok(itemImages[item.id], `${item.name} needs a photo`);
    const photo = fileURLToPath(
      new URL(`../public${itemImages[item.id]}`, import.meta.url),
    );
    assert.ok(existsSync(photo), `${item.name} photo is missing`);
    assert.ok(!paths.has(itemPath(item)), `${item.name} route is duplicated`);
    paths.add(itemPath(item));
  }
});

test("checkout total uses cent rounding and applies the reward once", () => {
  const cart = [{ unitPrice: 13.49, quantity: 2 }];
  assert.deepEqual(checkoutTotals(cart, 0.18, true), {
    subtotal: 26.98,
    delivery: 2.99,
    tax: 2.79,
    tip: 4.86,
    reward: 5,
    total: 32.62,
  });
});

test("order progression and cancellation gate share one status model", () => {
  const path = ["NEW"];
  while (path.at(-1) !== "COMPLETED") path.push(nextOrderStatus(path.at(-1)));
  assert.deepEqual(path, [
    "NEW",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
  ]);
  assert.equal(trackingStage("CONFIRMED"), 1);
  assert.equal(trackingStage("PREPARING"), 2);
  assert.equal(canRequestCancellation("CONFIRMED"), true);
  assert.equal(canRequestCancellation("PREPARING"), false);
  assert.equal(nextOrderStatus("CANCELLED"), "CANCELLED");
});
