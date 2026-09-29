# Handoff: Wing Theory — Concept B "Electric Urban" (delivery-only virtual brand)

## Overview
Wing Theory is a premium, **delivery-only virtual chicken-wing brand** (no physical storefronts, no location pages, no multi-location switching). This package is the approved visual source of truth for:
- Customer web app (desktop + mobile-first): Home, Menu, Product customization, Checkout, Order tracking, Account.
- Operator platform (desktop / tablet): Command Center, Live Orders, Kitchen Display (KDS), Menu Management, Analytics, Integrations.

The implementation prompt for Codex is in `CODEX_PROMPT.md`.

## About the design files
`design/Wing Theory - Electric Urban.dc.html` is a **design reference built in HTML**. It is a prototype showing the intended look and behavior. It is not production code to copy. Recreate it in the chosen stack (recommended: Next.js + React + TypeScript + Tailwind), using real components, routes and data.

To view it: serve the `design/` folder with any static server (for example `npx serve design`) and open the `.dc.html` file. It's a pan/zoom canvas of all screens. Photo areas are empty drop-in slots; real photography comes later.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, copy and interaction patterns are final. Match them closely, adjusting only for accessibility, responsiveness or technical feasibility.

## Design tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `bg` | `#0B0C0F` | Page background (graphite) |
| `surface` | `#16181D` | Cards, inputs, panels |
| `surface-2` | `#111317` | Admin sidebar, kanban column bg |
| `line` | `#2A2D35` | 1px borders, dividers, inactive tracks |
| `line-strong` | `#5A5E69` | Secondary button borders, dashed chart bars |
| `bar-muted` | `#3A3D46` | Neutral chart bars |
| `text` | `#F2F2EE` | Primary text |
| `text-2` | `#B4B7BF` | Secondary text, descriptions |
| `muted` | `#9A9DA6` | Labels, meta, inactive nav |
| `volt` | `#C6FF3D` | **Primary action color**: CTAs, active states, live dots, focus ring. Text on volt is always `#0B0C0F` |
| `magenta` | `#FF3D8B` | Heat 5, late/SLA risk, destructive (reject, 86), limited drops |
| `tangerine` | `#FF6A1F` | Heat accents, DoorDash channel |
| `orange-warn` | `#FF8A1F` | Warnings (inventory, sync error, BUSY), modifier highlight |
| `red-hot` | `#FF5A5A` | Heat 4, VERY BUSY |
| `yellow-lime` | `#E3F53A` | Heat 2 |
| `cobalt` | `#3D6BFF` | Uber Eats channel, secondary chart series |
| `cobalt-text` | `#8FA9FF` | Cobalt used as text on dark |

**Heat scale colors (0 to 5):** `#8A8E98`, `#C6FF3D`, `#E3F53A`, `#FF8A1F`, `#FF5A5A`, `#FF3D8B`.
**Heat gradient:** `linear-gradient(90deg, #C6FF3D, #FF6A1F, #FF3D8B)`.
**Channel colors:** Direct `#C6FF3D` · DoorDash `#FF6A1F` · Uber Eats `#3D6BFF` · Grubhub `#FF3D8B`.
**Capacity colors:** NORMAL `#C6FF3D` · BUSY `#FF8A1F` · VERY BUSY `#FF5A5A` · PAUSED `#FF3D8B`.
Tints: alert backgrounds use the alert color at 10% alpha (for example `rgba(255,61,139,.1)`), and selected option cards use `rgba(198,255,61,.08)` with a volt border.

### Typography (Google Fonts)
- **Anton 400**, always uppercase, for display and section headings. Hero h1 is 112px/0.9 (desktop) and 60px/0.9 (mobile). Section h2 is 72px/1, card titles 24–36px/1, admin page titles 36–38px.
- **Archivo 400–800** for all UI and body text. Body 14–16px, lead 20px, buttons 13–16px at weight 700–800 with letter-spacing 0.06em when uppercase.
- **JetBrains Mono 400–700** for kickers, labels, stats, prices, timers, order numbers. Labels are 10–12px, weight 700, letter-spacing 0.1–0.14em, uppercase. KPI values are 22–28px/700. KDS timers are 36px/700.

### Radius
Buttons and chips are pills (`999px`). Cards are 20px, with 24px for large promo cards. Inputs and option tiles are 12–14px, small thumbnails 10–12px, admin frame 16px, KDS tickets 18px.

### Spacing
4px base. Common steps are 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64 and 72. Desktop page gutter is 48px, admin content padding 24–32px, mobile gutter 20px.

### Elevation and effects
Mostly flat, with 1px `line` borders. Allowed effects:
- Glass order card on the hero: `rgba(22,24,29,.9)` + `backdrop-filter: blur(16px)`.
- Emphasis glow: `0 0 40px rgba(255,61,139,.18)` on the featured flavor card.
- Late order: `0 0 0 1px #FF3D8B, 0 0 24px rgba(255,61,139,.25)`.
- Toast: `0 10px 40px rgba(198,255,61,.35)`.

### Focus and motion
- Focus: `outline: 3px solid #C6FF3D; outline-offset: 2px` on every interactive element.
- Honor `prefers-reduced-motion` by disabling all transitions and animations.

## Screens

### Customer — Desktop (reference width 1280)
1. **Home**
   - Hero is 780px tall with a full-bleed photo and a left-to-right dark gradient (`rgba(11,12,15,.96)` → `.05`).
   - Nav bar: wordmark "WING THEORY." (the period is volt), links MENU / FLAVORS / DROPS / THEORY CLUB / CATERING, "Sign in", and a volt "CART · n" pill.
   - Hero copy, bottom-left: kicker "● DROP 12 LIVE · MANGO HABANERO × TAJÍN", h1 "WINGS, ENGINEERED TO OBSESSION." ("OBSESSION." in volt), sub "Crispy wings. Original sauces. Zero boring bites.", CTAs "ORDER YOUR THEORY" (volt) and "EXPLORE THE MENU" (ghost).
   - Hero, bottom-right: a 340px glass card with a "DELIVER TO" address field, "KITCHEN · {capacity}" with the ETA range in volt mono, and a note "Also on DoorDash · Uber Eats · Grubhub. Order direct to earn Theory Club points."
   - Sections below the hero, in order:
     - Flavor Theory: 4 cards with number, heat, a heat bar, sweet/savory meter and notes. Nashville Inferno is featured with a magenta border and glow.
     - Best sellers: 3 photo cards; the middle one is offset −24px.
     - Build Your Theory: 6 steps plus the "BUILD YOUR ORDER" CTA.
     - A 3-up row: Experiment 12 promo (magenta border), Theory Club benefits, Catering.
     - #TESTYOURTHEORY social grid (5 tiles).
     - Footer with SEO links.
2. **Menu**
   - Header with search and live ETA.
   - A 240px left category rail listing all 13 categories plus All. The active item is a volt pill.
   - Filter chips: Popular, New, Mild, Medium, Hot, Extreme, Vegetarian sides, Gluten-aware. Multi-select; each chip toggles and exposes `aria-pressed`.
   - 3-column product grid. Each card has a 200px photo, heat badge, Popular/New/SOLD OUT badges, number, name, description, mono price and a "+ Add" pill.
   - Sold-out items render at 55% opacity with a disabled "Sold out" button.
   - Empty state: "No items match these filters. Clear a filter to see more."
3. **Checkout**
   - Two columns (1.3fr / 1fr).
   - Left column:
     - Guest banner with "Sign in".
     - 01 Delivery: address, drop-off instructions, and ASAP or Schedule tiles.
     - 02 Contact: name, mobile, email.
     - 03 Payment: Card, Apple Pay, Google Pay, PayPal, Gift card, then card fields and a PCI note.
   - Right column (order summary):
     - Line items with quantity steppers.
     - "Complete the theory" dashed add-on chips.
     - Promo code field.
     - Tip selector: None, 15%, 18%, 20%.
     - Subtotal, delivery fee, tax, tip, Theory Club reward (−$5.00) and total.
     - "PLACE ORDER · $total".

### Customer — Mobile (390×844, one-handed)
The bottom tab bar reads HOME | MENU | ORDER | REWARDS | ACCOUNT, with the active tab in volt. Primary actions sit in a sticky bottom area and are 58px pills. Minimum touch target is 44px.
- **M Home:** 470px photo hero with ETA pill, "Deliver to…" field, a horizontally scrolling flavor strip and an "ORDER YOUR THEORY" CTA.
- **M Menu:** scrolling category pills, list cards (84px thumbnail, name, price, heat), a round volt quick-add button and a sticky "CART · n" bar. Quick-add shows the toast "Added. Sauce incoming." for 1.8s.
- **M Customize:**
  - Chicken: Bone-In, Boneless or Tenders.
  - Quantity: 6, 10, 15, 20, 30 or 50. The label shows allowed sauces: 1 sauce under 15, up to 2 at 15–20, up to 3 at 30+.
  - Heat card: 0–5 buttons, a gradient meter and a copy line per level.
  - Crispiness: Classic or Extra Crispy.
  - Dips as chips.
  - "ADD TO ORDER · $price" (dynamic).
- **M Cart/Checkout:** address, ASAP or Schedule, items, add-ons, "Use 500 pts" toggle, tip, Apple Pay and card options, "PLACE ORDER".
- **M Tracking:**
  - Stages: Order received → Confirmed → Wings in the lab → Sauced → Packed → Out for delivery → Delivered.
  - Headline copy per stage: "ORDER RECEIVED.", "THE THEORY IS IN MOTION.", "YOUR THEORY IS GETTING CRISPY.", "YOUR THEORY IS GETTING SAUCED.", "PACKED. SEALED. LEAVING.", "ON THE MOVE.", "THE RESULTS ARE IN."
  - Big ETA in minutes, a 7-segment progress bar and a stage list using ✓ ● ○ (not color alone).
  - A driver card appears from Out for delivery onward.
  - **Cancellation:** "Request cancellation" shows only before prep starts, with the note "Refunds follow restaurant review." After that, show "The kitchen has started your order. For changes or cancellation, contact support."
- **M Account:** profile and tier, Theory Club points card with progress, recent orders with Reorder, favorites, favorite flavors, saved addresses, payment methods, gift cards, referral, communication preferences.

### Operator — Desktop (reference 1440×900)
- **Admin navigation (210px sidebar):** Dashboard, Orders (active count), Kitchen, Menu, Inventory, Customers, Promotions, Theory Club, Delivery, Catering, Reviews, Marketing, Analytics, Finance, Staff, Integrations, Settings. **There is no Locations entry.**
- **Command Center:**
  - Header "WING THEORY COMMAND CENTER" with date and time.
  - **Kitchen capacity** segmented control: NORMAL / BUSY / VERY BUSY / PAUSED, with a consequence note.
  - Seven KPI tiles: revenue, orders, average ticket, active, near-SLA (magenta), average prep, rating and cancellation rate.
  - Sales and hourly-demand bar chart: today vs typical, with the current hour in volt.
  - Best sellers, delivery performance and low stock.
  - Alerts column: SLA risk, Garlic Parmesan low (with an "86 it" action), demand +27%, channel-mix bar, and Uber Eats sync error.
- **Live Orders:**
  - 4-column kanban: NEW / PREPARING / READY / OUT FOR DELIVERY.
  - Each card shows #id, age, time left, customer, item count, total, channel dot, a special-instructions callout (orange left border) and actions.
  - Actions: New → "Accept" + "Reject"; Preparing → "Mark ready"; Ready → "Driver picked up"; Out → "Complete". The "⋯" button opens Delay, Contact customer, Cancel, Refund (full or partial), Print and View details.
  - Orders with ≤3 min left get a magenta outline and glow plus a "Nm LEFT" label.
- **Kitchen Display:**
  - Black background, station tabs FRY / SAUCE / ASSEMBLY / PACKAGING with counts, and a large clock.
  - Tickets have a colored header strip (magenta = late, orange = warning, grey = on time) showing #id and a 36px mono timer.
  - Status line shows channel and due time. Items are 22–26px bold with sauces in volt.
  - Modifier pills: EXTRA CRISPY (orange fill), ⚠ ALLERGY (magenta fill), NO RANCH (outlined).
  - 72px "BUMP ✓" button.
- **Menu Management:**
  - Item table: photo, name, status (● ACTIVE / ● SOLD OUT), category, price, heat, channels, and an "86 item" / "Restore" toggle.
  - Tabs: All items, Categories, Modifier groups, Sauces, Scheduled & limited.
  - Right-hand editor: photo, name, description, size/price matrix (6–50), modifier groups, allergens and nutrition.
  - Footer note: availability pushes to all connected channels immediately.
- **Analytics:**
  - Eight KPIs: gross sales, net sales, orders, average order value, prep/delivery time, refunds/discounts, repeat rate, club members.
  - Revenue by hour chart, top flavors bars, new vs returning donut, revenue by channel, top products, loyalty participation.
  - **No location performance.**
- **Integrations:**
  - Delivery providers: Direct delivery (LIVE), DoorDash (CONNECTED), Uber Eats (▲ SYNC ERROR + Retry), Grubhub (○ NOT CONNECTED + Connect), and "+ Add provider".
  - Health strip: marketplace orders, outages, open sync errors, commissions.
  - POS cards for Toast, Square, Clover and Oracle MICROS are all "○ PLANNED" with dashed borders. Never imply they are live.

## Interactions and cross-screen behavior (implement these)
- **Capacity → ETA:** NORMAL is 28–36 min, BUSY 40–48, VERY BUSY 55–63. PAUSED disables direct ordering, shows "Ordering paused" and pauses marketplace channels. Every customer ETA reads from this setting.
- **86 / sold out → customer menu:** toggling an item in Menu Management instantly shows it as sold out on customer menus and marketplace menus.
- **Order state machine:** operator actions advance orders, and the customer tracking screen reflects the same state.
- **Cancellation eligibility:** customers may request cancellation only before prep starts.
- **Quick add:** increments the cart count and shows the toast (live region `role="status"`).
- **Heat, quantity, tip and filters:** client state with instant visual feedback. Heat pips light from 1 up to the selected level. Price updates with quantity.

## Assets
There is no photography yet; every photo is a labeled placeholder describing the intended shot (for example "Hero: Korean Fire wings on black, rim light, steam rising"). Direction: low-key dark backgrounds, rim light, steam, sauce gloss, macro crops. Icons are text glyphs in the mock; use Lucide in production.

## Files
- `design/Wing Theory - Electric Urban.dc.html`: all screens, tokens, copy and interaction logic. The data arrays (ITEMS, ORDERS, STAGES, CAPS) in its script are good seed data.
- `design/support.js`, `design/image-slot.js`: runtime needed only to view the prototype.
- `CODEX_PROMPT.md`: the build prompt.
