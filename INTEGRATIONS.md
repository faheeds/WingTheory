# Integration boundary

No marketplace, POS or payment provider is live in this local demo. Status labels in the operator interface reflect that.

A live delivery provider adapter should cover menu sync, incoming order verification, status updates, pausing and resuming intake, driver status, dispatch, tracking, commissions and error reporting. Each adapter needs sandbox tests and a monitored production connection. DoorDash, Uber Eats and Grubhub must stay disconnected until that work is complete.

The `DeliveryProvider` contract and a fail-closed unconfigured adapter live in `src/lib/integrations.ts`. A new provider implementation must verify webhook signatures, map its order states into the shared state machine, report connection health truthfully, and pass sandbox tests before it can be marked connected.

Uber Direct is a courier dispatch service, not a marketplace order feed. A server-side API client for OAuth, delivery quotes, dispatch requests and webhook signature checks lives in `src/lib/uber-direct.ts`. It is not connected to checkout or the operator demo and cannot dispatch from the public site. Before connecting it, store Uber Direct client ID, client secret, customer ID and a separately generated webhook signing key as server-only environment secrets. Verify whether the account uses test or production credentials. Test credentials cannot dispatch a real courier. Persist the quote ID and expiration, then dispatch only after a verified payment and durable order record. Configure signed webhooks, track dispatch failures, and provide staff with a recovery or refund path before enabling live checkout.

Toast, Square, Clover and Oracle MICROS are planned POS integrations only. The interface does not imply a current connection.

For payments, use a hosted payment element and verified server webhooks. Recalculate prices and validate modifiers on the server, store no card details, and apply refunds through the payment provider. Operator actions need authenticated permission checks and audit records before launch.

Production credentials for Uber Direct and Stripe have been added to the Vercel Production environment, but presence of a secret does not verify that it is valid or connected. The public checkout remains a demo and must not be switched to live ordering yet. `src/lib/live-order.ts` validates cart lines and recalculates menu prices server-side. `db/001_direct_orders.sql` was applied to the main branch of the Wing Theory Neon database on September 29, 2026. The three tables were verified in Neon with row level security enabled and public privileges revoked. Payment session creation, Stripe webhook processing, Uber quote and dispatch orchestration, staff authentication, email alerts, tax configuration, and failure recovery remain to be implemented and tested.

`src/lib/payment-server.ts` rejects malformed Stripe keys, refuses test keys in a Vercel production runtime, and verifies webhook signatures over the raw body. `src/lib/database-server.ts` provides a server-side Neon connection. Neither module is connected to a public payment route yet. The Stripe restricted key may still lack the required Checkout Session permissions, and its value cannot be validated merely by seeing that Vercel stores the variable.

`src/lib/order-alert-server.ts` prepares plain-text paid-order alerts for `support@wing-theory.com` using Resend and a stable order-specific idempotency key. It is not called by checkout yet. Before sending production alerts, verify `wing-theory.com` in Resend, add a sending-only `RESEND_API_KEY` to Vercel Production, and confirm that `support@wing-theory.com` receives a test message. Resend's sending service is separate from the existing support inbox.
