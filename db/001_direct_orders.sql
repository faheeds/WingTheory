-- Reviewed schema for direct delivery orders. Apply before enabling checkout.
-- This table is server-only. Never expose DATABASE_URL to browser code.

begin;

create table if not exists direct_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment', 'payment_expired', 'payment_failed', 'paid',
      'dispatch_pending', 'dispatched', 'dispatch_failed',
      'completed', 'cancelled', 'refunded'
    )),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_instructions text not null default '',
  cart jsonb not null check (jsonb_typeof(cart) = 'array'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  delivery_fee_cents integer not null check (delivery_fee_cents >= 0),
  tax_cents integer check (tax_cents >= 0),
  total_cents integer check (total_cents >= 0),
  uber_quote_id text not null,
  uber_quote_expires_at timestamptz not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  uber_delivery_id text unique,
  uber_tracking_url text,
  failure_reason text,
  notification_sent_at timestamptz
);

create index if not exists direct_orders_created_at_idx
  on direct_orders (created_at desc);
create index if not exists direct_orders_needs_attention_idx
  on direct_orders (created_at)
  where status in ('paid', 'dispatch_pending', 'dispatch_failed');

-- Stripe retries events. Store the event ID to make processing idempotent.
create table if not exists stripe_webhook_events (
  id text primary key,
  event_type text not null,
  order_id uuid references direct_orders (id),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);

create index if not exists stripe_webhook_events_unprocessed_idx
  on stripe_webhook_events (received_at)
  where processed_at is null;

-- Uber events also need deduplication and an audit trail.
create table if not exists uber_delivery_events (
  id text primary key,
  order_id uuid references direct_orders (id),
  event_type text not null,
  received_at timestamptz not null default now(),
  payload jsonb not null
);

create index if not exists uber_delivery_events_order_idx
  on uber_delivery_events (order_id, received_at desc);

-- No browser role may read customer addresses or payment and delivery events.
-- The server connects as the database owner, which retains access.
alter table direct_orders enable row level security;
alter table stripe_webhook_events enable row level security;
alter table uber_delivery_events enable row level security;

revoke all on direct_orders, stripe_webhook_events, uber_delivery_events from public;

commit;
