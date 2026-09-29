import Stripe from "stripe";

export class PaymentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigurationError";
  }
}

/** A live deployment must never use a test key, even if Vercel has the variable. */
export function stripeKeyMode(key: string): "live" | "test" {
  if (/^(sk|rk)_live_\S+$/.test(key)) return "live";
  if (/^(sk|rk)_test_\S+$/.test(key)) return "test";
  throw new PaymentConfigurationError("Stripe key is not a recognized secret or restricted key.");
}

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new PaymentConfigurationError("Stripe secret key is not configured.");
  const mode = stripeKeyMode(key);
  if (process.env.VERCEL_ENV === "production" && mode !== "live") {
    throw new PaymentConfigurationError("A production deployment requires a live Stripe key.");
  }
  return new Stripe(key);
}

/** Verify Stripe's signature over the unmodified request body before parsing it. */
export function verifyStripeWebhook(
  rawBody: string | Buffer,
  signature: string | null,
  signingSecret: string,
): Stripe.Event {
  if (!signature || !signingSecret) {
    throw new PaymentConfigurationError("Stripe webhook signature or signing secret is missing.");
  }
  return new Stripe("sk_test_signature_verification_only").webhooks.constructEvent(
    rawBody,
    signature,
    signingSecret,
  );
}
