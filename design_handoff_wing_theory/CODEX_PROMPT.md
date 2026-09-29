# WING THEORY — IMPLEMENTATION PROMPT FOR CODEX

## 0. Read first
The approved visual design is in this repository at `design_handoff_wing_theory/`.
- `README.md` holds the exact tokens, typography, screen specs, copy and interactions. **It is the visual source of truth.**
- `design/Wing Theory - Electric Urban.dc.html` is the HTML prototype of every screen. Serve it with `npx serve design_handoff_wing_theory/design` to see it.

Do not redesign the product and do not substitute a generic restaurant template. Implement the approved design faithfully, and make it responsive, accessible, performant, SEO-optimized and production-ready. Deviate visually only when accessibility or technical feasibility requires it, and note each deviation in `DECISIONS.md`.

## 1. Business context
**Wing Theory is a delivery-only virtual brand.** It runs from one production kitchen, with a data model that can support more kitchens later. It has **no customer-facing locations**:
- Remove all location pages, store pickers, "nearest location", `/locations/*` routes, store hours pages and a multi-location admin switcher.
- Customers enter a **delivery address**. The system checks it against the kitchen's delivery zone and quotes one ETA.
- Orders arrive from **Direct (first-party website)**, **DoorDash**, **Uber Eats** and **Grubhub**. They are all aggregated into one kitchen queue.
- Keep `Kitchen` as an internal entity (address, delivery zone polygon, hours, prep times, taxes, capacity) so a second kitchen can be added later without refactoring. Do not expose it in the customer UI.

Order types to support: **Delivery (ASAP)**, **Scheduled delivery** and **Catering** (delivery, lead time ≥ 24h). Pickup, curbside and dine-in are out of scope. Keep the fulfillment type an enum so they can be added later.

## 2. Stack
Use this stack unless there's a justified engineering reason not to (record any change in `DECISIONS.md`):
- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS configured with the tokens from README (colors, fonts, radii, spacing). Put no raw hex values in components.
- PostgreSQL + Prisma
- Redis for cache, queues and rate limiting
- Stripe (Payment Element, Apple Pay, Google Pay, Link; PayPal via Stripe where available), Stripe Tax or an equivalent
- Auth.js (email magic link, Google, Apple) plus guest checkout
- Cloudinary or an equivalent image CDN with `next/image`
- Resend or an equivalent for email; Twilio or an equivalent for SMS order updates
- Mapbox or Google for address autocomplete, geocoding and delivery-zone checks
- Realtime order updates via SSE or WebSockets (for example Pusher, Ably or a self-hosted option)
- Sentry for errors and performance; privacy-conscious analytics (PostHog or Plausible)
- Vitest + Playwright + axe-core; GitHub Actions CI

Fonts: Anton, Archivo and JetBrains Mono via `next/font` (self-hosted, `display: swap`).

## 3. Build order (deliver in phases, each one working end-to-end)
1. **Foundation:** repo, CI, tokens → Tailwind theme, base UI primitives (Button [primary volt / ghost / destructive], Chip, Card, Input, SegmentedControl, HeatScale, Badge, Toast, BottomTabBar, AdminShell), Prisma schema, seed data (use the ITEMS, ORDERS, STAGES and CAPS arrays from the prototype).
2. **Customer browsing:** Home, Menu, Menu category, Product detail/customizer, Flavors/Theory pages. Static generation or ISR, full structured data.
3. **Cart and checkout:** address and zone validation, ASAP or scheduled, promos, rewards, tip, tax, fees, Stripe payment, guest checkout, confirmation.
4. **Order lifecycle:** state machine, customer tracking (realtime), SMS and email notifications, cancellation rules.
5. **Operator core:** AdminShell, Command Center, Live Orders, KDS, kitchen capacity control.
6. **Menu and inventory management:** CRUD, modifiers, 86/sold out, scheduled and limited items, allergens and nutrition.
7. **Accounts and loyalty:** Theory Club, account area, favorites, reorder, gift cards, referrals.
8. **Integrations:** delivery-provider adapter layer (Direct live; DoorDash, Uber Eats and Grubhub adapters behind interfaces with sandbox/mock implementations), POS adapter interfaces (Toast, Square, Clover, Oracle MICROS as stubs only).
9. **Analytics, CRM, promotions, reviews, staff and roles, finance reports.**
10. **Hardening:** performance, accessibility and security audits, and the full QA pass (section 17).

## 4. Customer website — routes
```
/                         Home
/menu                     Full menu (SSR/ISG, crawlable)
/menu/[category]          e.g. /menu/wings, /menu/chicken-sandwiches, /menu/sides
/menu/[category]/[item]   Product detail + customizer
/flavors  /flavors/[slug] Theory pages (No.01 … No.12, Experiments)
/build                    Build Your Theory guided flow
/cart  /checkout  /order/[id]/confirmation  /order/[id]/track
/rewards                  Theory Club
/account  /account/orders  /account/favorites  /account/addresses
/account/payment  /account/gift-cards  /account/preferences
/gift-cards  /catering  /about  /faq  /contact  /careers  /blog  /blog/[slug]
/allergens  /accessibility  /privacy  /terms
```
Desktop layouts match the 1280px reference. Mobile matches the 390px phones: bottom tab bar HOME | MENU | ORDER | REWARDS | ACCOUNT, sticky bottom primary actions, 44px minimum targets. Don't just shrink the desktop layout.

## 5. Product customization
- Chicken type: Bone-In, Boneless, Tenders.
- Quantity: 6, 10, 15, 20, 30, 50, each with its own price.
- Sauces: sauce limit by quantity (<15 → 1, 15–29 → 2, ≥30 → 3) with split-count validation.
- Crispiness: Classic, Extra Crispy.
- Sauce level: Light, Regular, Extra Saucy.
- Heat 0–5: No Heat, Mild, Medium, Hot, Fire, Theory Breaker. Use the HeatScale component with colors from README and one copy line per level.
- Dips and sides, special instructions (max 140 characters), allergy notice.
- Dynamic pricing, and server-side modifier validation, which is the source of truth for price.

## 6. Order lifecycle (single state machine shared by customer and operator)
```
CREATED → PAYMENT_PENDING → PAID → CONFIRMED → PREPARING → READY
→ DRIVER_ASSIGNED → OUT_FOR_DELIVERY → COMPLETED
Terminal/side: CANCELLED, REFUNDED, PARTIALLY_REFUNDED, REJECTED
```
- Record every transition in `OrderStatusHistory` (actor, source channel, reason, timestamp).
- Customer tracking stages map onto these states: Order received, Confirmed, Wings in the lab, Sauced, Packed, Out for delivery, Delivered. Use the headline copy from README.
- **Cancellation:** a customer may *request* cancellation only while the order is PAID or CONFIRMED and prep hasn't started. After PREPARING, show "The kitchen has started your order. For changes or cancellation, contact support." Never present cancellation as guaranteed.
- Support full refund, partial refund, rejection with reason, operator override and an audit history.
- Marketplace orders follow the provider's cancellation and refund rules through their adapter.

## 7. Kitchen capacity
The operator sets NORMAL, BUSY, VERY BUSY or PAUSED in the Command Center.
- Quoted ETA = base prep + queue load + delivery estimate, plus the capacity offset (+0 / +12 / +27 min).
- **PAUSED** disables direct ordering and shows "Ordering paused" wherever an ETA appears. It also pauses marketplace stores through their adapters where the API supports it.
- Changes propagate in realtime to the Home hero, the menu header and checkout.

## 8. Operator platform
Admin navigation: Dashboard, Orders, Kitchen, Menu, Inventory, Customers, Promotions, Theory Club, Delivery, Catering, Reviews, Marketing, Analytics, Finance, Staff, Integrations, Settings. There is no Locations entry.
- **Command Center:**
  - KPIs: revenue, orders, average ticket, active, near-SLA, average prep, delivery performance, cancellation and refund rate, rating.
  - Hourly sales vs typical, best sellers, low stock, channel mix, operational alerts, capacity control.
- **Live Orders:**
  - Kanban: NEW / PREPARING / READY / OUT FOR DELIVERY, across all channels.
  - Each card: SLA timer, special-instruction highlight, and late styling (magenta outline plus a "min left" text label).
  - Actions: Accept, Reject (with reason), Start Prep, Mark Ready, Delay, Contact customer, Cancel, Refund, Print, View details.
  - Audio alert for new orders; the operator can mute it.
- **KDS:** large-touchscreen layout on a black background.
  - Stations: Fry, Sauce, Assembly, Packaging, with routing by item and modifier.
  - Tickets: large timers, a colored header for status plus a text label, and modifier pills (EXTRA CRISPY, ⚠ ALLERGY, NO RANCH, "2 × HOT HONEY").
  - Bump, recall and expedite; prioritization by promised time.
- **Menu Management:**
  - CRUD for categories, products, variants/quantities, prices, descriptions, photos, modifier groups, sauces, sides, dips, allergens, nutrition, dayparts, and scheduled and limited-time items.
  - Statuses: Active, Inactive, Scheduled, Sold Out.
  - **86 item / Restore** updates the direct menu instantly and queues a sync to every connected marketplace.
- **Inventory:** ingredients, low-stock thresholds, out-of-stock (can auto-86 dependent items), usage estimates, alerts, optional POS sync.
- **Analytics:**
  - Gross and net sales, orders, average order value, prep and delivery time, cancellations, refunds, discounts.
  - Product and flavor performance, revenue by hour and by channel, new vs returning, retention, loyalty participation, repeat rate.
- **Customers (CRM):**
  - Profiles, order frequency, lifetime value, favorite products and sauces, rewards, marketing preferences.
  - Segments: new, repeat, VIP, inactive, high-frequency, catering.
- **Promotions:**
  - Discount types: percentage, fixed amount, BOGO, free item, free delivery.
  - Restrictions and rules: channel restrictions, date ranges, minimum subtotal, unique or single-use codes, loyalty-only offers.
- **Theory Club:** points, rewards, redemption, birthday benefit, referral codes, exclusive drops, member promotions, optional tiers.
- **Staff and permissions:**
  - Roles: Owner, Administrator, General Manager, Kitchen Manager, Kitchen Staff, Customer Support, Marketing, Finance, Analyst.
  - Permissions are configurable per role and checked server-side, not by role name.

## 9. Integrations (never fake them)
- A `DeliveryProvider` adapter interface covering: menu sync, order ingest (webhooks), status updates, store pause/resume, driver status, quotes, dispatch, tracking, commission reporting and error reporting. Implementations: `DirectDelivery` (live: own drivers or an on-demand dispatch provider), plus `DoorDash`, `UberEats` and `Grubhub` with sandbox/mock modes. Show real connection status only.
- A `POSProvider` adapter interface with Toast, Square, Clover and Oracle MICROS as documented stubs, displayed as "○ PLANNED" in the UI. Don't build business logic around any one POS.
- An integration health page: connection status, last menu sync, sync errors with retry, outages and incoming order counts.

## 10. Payments
Stripe with PCI-compliant hosted elements; never store card data. Support card, Apple Pay, Google Pay, PayPal where supported, gift cards, tips, taxes, promotions, refunds and partial refunds. Handle payment errors with clear, announced messages.

## 11. SEO
- SSR/SSG for all public pages. The menu must be fully crawlable HTML, not rendered only on the client.
- Metadata: unique titles and meta descriptions, canonical URLs, OpenGraph and Twitter cards.
- Crawling: XML sitemap, robots.txt, clean URLs, breadcrumbs, internal linking.
- Optimized responsive images.
- Structured data (only where real data supports it):
  - Organization, WebSite and Restaurant. Mark it as delivery-only: no public street address, and `areaServed` set to the delivery-zone city.
  - Menu, MenuSection, MenuItem and Offer; BreadcrumbList; FAQPage.
  - Add AggregateRating only when you have legitimate first-party rating data.
- **No LocalBusiness location pages.**

## 12. Accessibility (WCAG 2.2 AA)
- Keyboard navigation throughout, with the visible focus ring (3px volt) and managed focus on dialogs and route changes.
- Forms: labeled fields, errors announced with `aria-live`.
- Status is never shown by color alone. Use the text and symbol pairs from the design (● ▲ ○ ✓).
- Touch targets ≥ 44px, `prefers-reduced-motion` respected, alt text on all imagery.
- Text contrast ≥ 4.5:1. Text on volt, magenta and orange fills is always `#0B0C0F`.

## 13. Performance
Target Lighthouse > 90 on mobile for Home, Menu and Product pages. Use image CDN transforms, self-hosted fonts, code splitting, lazy loading below the fold, edge caching for menu pages, revalidate on menu change, and minimal client JS on marketing pages.

## 14. Security
Secure sessions, RBAC plus a permission check on every admin route and action, rate limiting (auth, checkout, promo validation), server-side validation with Zod, CSRF protection, XSS and injection protections, verified webhook signatures (Stripe and marketplaces), secrets in environment/secret manager, audit logs for refunds, cancellations, price changes and 86 toggles, least-privilege access.

## 15. Data model (minimum)
User, CustomerProfile, Brand, Kitchen, DeliveryZone, Address, Menu, MenuCategory, MenuItem, MenuItemVariant, ModifierGroup, Modifier, Sauce, InventoryItem, Cart, CartItem, Order, OrderItem, OrderStatusHistory, Payment, Refund, Promotion, PromoCode, GiftCard, RewardAccount, RewardTransaction, Referral, Delivery, DeliveryProvider, ProviderConnection, MenuSyncJob, POSIntegration, Employee, Role, Permission, Review, CateringOrder, Notification, AuditLog, CapacitySetting.

## 16. Observability and analytics
- Sentry covers application errors, API errors, payment errors, integration and webhook health, order-pipeline monitoring and performance. Set up operational alerts for SLA breaches and sync failures.
- Analytics events: `address_entered`, `menu_viewed`, `menu_search`, `menu_filter_used`, `product_viewed`, `customization_started`, `item_added_to_cart`, `upsell_clicked`, `checkout_started`, `promo_applied`, `payment_started`, `order_placed`, `order_cancel_requested`, `order_cancelled`, `order_completed`, `reward_redeemed`, `reorder_clicked`, `catering_started`, `signup_completed`.

## 17. Required QA before completion
Automated (Playwright + axe) and manual checks:
- **Ordering:** guest checkout, account checkout, scheduled delivery, out-of-zone address.
- **Order contents and pricing:** modifier validation and price math, promos, rewards, payment errors.
- **Order lifecycle:** cancellation rules at every state, realtime tracking.
- **Operator:** order handling across all 4 channels, KDS states, sold-out propagation, capacity effect on ETA (including PAUSED), role permissions.
- **Integrations:** failures and retries.
- **Presentation:** responsive at 360/390/768/1280/1440, accessibility, SEO metadata and structured-data validation, Lighthouse, error and empty states.

## 18. Deliverables
- Working app with seed data and `README` setup (`pnpm i && pnpm db:seed && pnpm dev`).
- `.env.example` covering every provider key.
- `DECISIONS.md` (stack choices and any visual deviations).
- `INTEGRATIONS.md` (adapter interfaces and how to add a provider).
- A test suite passing in CI.

Start with Phase 1. At the end of each phase, summarize what was built, what's stubbed, and anything that differs from the design.
