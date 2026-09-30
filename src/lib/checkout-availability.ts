/** Keep real charges closed until paid-order dispatch and recovery are ready. */
export function stripeCheckoutAvailable(): boolean {
  return process.env.VERCEL_ENV !== "production" &&
    process.env.STRIPE_CHECKOUT_TEST_MODE === "enabled" &&
    process.env.NEXT_PUBLIC_CHECKOUT_MODE === "stripe_test";
}
