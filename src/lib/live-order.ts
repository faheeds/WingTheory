import {
  isWingItem,
  items,
  priceForItem,
  quantityOptions,
  type MenuItem,
} from "./data.ts";

export type ValidatedOrderLine = {
  itemId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  pieces: number | null;
  chicken: string | null;
  sauces: string[];
  crispiness: string | null;
  sauceLevel: string | null;
  dips: string[];
  instructions: string;
};

export type ValidatedCart = {
  lines: ValidatedOrderLine[];
  subtotalCents: number;
  manifestItems: Array<{ name: string; quantity: number }>;
};

const chickenChoices = new Set(["Bone-In", "Boneless", "Tenders"]);
const crispinessChoices = new Set(["Classic", "Extra Crispy"]);
const sauceLevelChoices = new Set(["Light", "Regular", "Extra Saucy"]);
const dipChoices = new Set(["Ranch", "Blue Cheese", "Hot Honey", "Garlic Aioli"]);
const sauceChoices = new Set(
  items
    .filter((item) => item.category === "Signature Wings" || item.category === "Bone-In Wings")
    .map((item) => item.name),
);
const itemById = new Map(items.map((item) => [item.id, item]));

export class InvalidCartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCartError";
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function choice(value: unknown, allowed: Set<string>, label: string): string {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new InvalidCartError(`Invalid ${label}.`);
  }
  return value;
}

function choices(value: unknown, allowed: Set<string>, maximum: number, label: string): string[] {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new InvalidCartError(`Invalid ${label}.`);
  }
  const selected = value.map((entry) => choice(entry, allowed, label));
  if (new Set(selected).size !== selected.length) {
    throw new InvalidCartError(`Duplicate ${label}.`);
  }
  return selected;
}

function cents(value: number): number {
  return Math.round(value * 100);
}

function validateLine(value: unknown): ValidatedOrderLine {
  if (!record(value) || typeof value.itemId !== "string") {
    throw new InvalidCartError("An item is missing or invalid.");
  }
  const menuItem: MenuItem | undefined = itemById.get(value.itemId);
  if (!menuItem) throw new InvalidCartError("An item is no longer on the menu.");
  if (!Number.isInteger(value.quantity) || Number(value.quantity) < 1 || Number(value.quantity) > 20) {
    throw new InvalidCartError("Item quantity must be between 1 and 20.");
  }
  const quantity = Number(value.quantity);
  const instructions = value.instructions ?? "";
  if (typeof instructions !== "string" || instructions.length > 140) {
    throw new InvalidCartError("Special instructions are too long.");
  }

  if (!isWingItem(menuItem)) {
    for (const field of ["pieces", "chicken", "sauces", "crispiness", "sauceLevel", "dips"]) {
      if (value[field] !== undefined) {
        throw new InvalidCartError(`${menuItem.name} does not have wing options.`);
      }
    }
    return {
      itemId: menuItem.id,
      name: menuItem.name,
      quantity,
      unitPriceCents: cents(menuItem.price),
      pieces: null,
      chicken: null,
      sauces: [],
      crispiness: null,
      sauceLevel: null,
      dips: [],
      instructions,
    };
  }

  const pieces = value.pieces;
  if (typeof pieces !== "number" || !quantityOptions.includes(pieces)) {
    throw new InvalidCartError("Invalid wing count.");
  }
  const chicken = choice(value.chicken, chickenChoices, "chicken choice");
  const crispiness = choice(value.crispiness, crispinessChoices, "crispiness");
  const sauceLevel = choice(value.sauceLevel, sauceLevelChoices, "sauce level");
  const maxSauces = pieces >= 30 ? 3 : pieces >= 15 ? 2 : 1;
  const sauces = choices(value.sauces, sauceChoices, maxSauces, "sauce selection");
  if (sauces.length === 0) throw new InvalidCartError("Choose at least one sauce.");
  const dips = choices(value.dips, dipChoices, dipChoices.size, "dip selection");

  return {
    itemId: menuItem.id,
    name: menuItem.name,
    quantity,
    unitPriceCents: cents(priceForItem(menuItem, pieces, crispiness === "Extra Crispy", dips.length)),
    pieces,
    chicken,
    sauces,
    crispiness,
    sauceLevel,
    dips,
    instructions,
  };
}

/** Prices and modifiers are rebuilt from the published menu, never from the browser's unitPrice. */
export function validateCart(value: unknown): ValidatedCart {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
    throw new InvalidCartError("The cart must contain 1 to 20 lines.");
  }
  const lines = value.map(validateLine);
  const quantity = lines.reduce((total, line) => total + line.quantity, 0);
  if (quantity > 50) throw new InvalidCartError("The cart has too many items.");
  const subtotalCents = lines.reduce(
    (total, line) => total + line.unitPriceCents * line.quantity,
    0,
  );
  return {
    lines,
    subtotalCents,
    manifestItems: lines.map((line) => ({ name: line.name, quantity: line.quantity })),
  };
}
