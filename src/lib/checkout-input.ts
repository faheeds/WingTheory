export type DeliveryCheckoutInput = {
  cart: unknown;
  name: string;
  email: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  instructions: string;
};

export class InvalidCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCheckoutError";
  }
}

function required(value: unknown, label: string, limit: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > limit) {
    throw new InvalidCheckoutError(`Enter a valid ${label}.`);
  }
  return value.trim();
}

export function parseDeliveryCheckoutInput(value: unknown): DeliveryCheckoutInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidCheckoutError("Checkout details are missing.");
  }
  const input = value as Record<string, unknown>;
  const name = required(input.name, "name", 100);
  const email = required(input.email, "email", 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InvalidCheckoutError("Enter a valid email address.");
  }
  const phone = required(input.phone, "phone number", 30);
  if (phone.replace(/\D/g, "").length < 10) {
    throw new InvalidCheckoutError("Enter a valid phone number.");
  }
  const street = required(input.street, "street address", 150);
  const apartment = input.apartment ?? "";
  if (typeof apartment !== "string" || apartment.length > 100) {
    throw new InvalidCheckoutError("Apartment or unit is too long.");
  }
  const city = required(input.city, "city", 80);
  const state = required(input.state, "state", 2).toUpperCase();
  if (state !== "WA") {
    throw new InvalidCheckoutError("Delivery is currently limited to Washington addresses.");
  }
  const postalCode = required(input.postalCode, "ZIP code", 10);
  if (!/^\d{5}(?:-\d{4})?$/.test(postalCode)) {
    throw new InvalidCheckoutError("Enter a valid ZIP code.");
  }
  const instructions = input.instructions ?? "";
  if (typeof instructions !== "string" || instructions.length > 500) {
    throw new InvalidCheckoutError("Drop-off instructions are too long.");
  }
  return {
    cart: input.cart, name, email, phone, street,
    apartment: apartment.trim(), city, state, postalCode,
    instructions: instructions.trim(),
  };
}

export function uberAddress(input: Pick<DeliveryCheckoutInput, "street" | "city" | "state" | "postalCode">): string {
  return JSON.stringify({
    street_address: [input.street],
    city: input.city,
    state: input.state,
    zip_code: input.postalCode,
    country: "US",
  });
}

export function displayAddress(input: DeliveryCheckoutInput): string {
  return [input.street, input.apartment, `${input.city}, ${input.state} ${input.postalCode}`]
    .filter(Boolean)
    .join(", ");
}
