# Wing Theory

Wing Theory is a responsive customer site and operator demo built from the supplied Electric Urban design handoff. It includes the home page, menu, product customization, cart, demo checkout, order tracking, account views, and the main operator views.

## Run locally

Install dependencies with `npm install`, then start the site with `npm run dev`. Open `http://localhost:3000`. Use `npm run build` to check the production build and `npm test` for the order and pricing rules.

The app uses browser storage to share demo state across the customer and operator routes. Open `/operator` to change capacity, advance orders and mark menu items sold out. Open `/menu` to see those changes. The seed data comes from the supplied design prototype.

## Current scope

This is a working local demo. Checkout creates a sample unpaid order. It does not collect card details, process payments, dispatch delivery, send messages, connect marketplace accounts or authenticate operators. Public-facing forms that require a connected service say so in the interface. Do not deploy the operator demo as a live operations system.

The hero and all twenty-four menu items have generated editorial concept photography. These images are optimized WebP files in `public/images`. They are not photos of actual Wing Theory food, so replace or approve them against the real dishes before a commercial launch. The newly added dips, desserts, drinks, combos, family packs, and catering entries are proposed menu content with provisional prices. Confirm their names, recipes, portions, and prices before a commercial launch. Catering currently follows the demo cart flow and does not enforce the stated 24-hour notice. Copy and design tokens follow the supplied README.

## Paths

Customer: `/`, `/menu`, product routes, `/build`, `/cart`, `/checkout`, `/order/[id]/track`, `/rewards`, `/account`, `/catering`, and informational pages.

Operator: `/operator`, `/operator/orders`, `/operator/kitchen`, `/operator/menu`, `/operator/analytics`, `/operator/integrations`, and supporting navigation views.

## Before a live launch

Add a persistent server database, secure customer and operator authentication, permission checks for every operator action, payment and tax processing, delivery-zone validation, notifications, marketplace adapters, and a real cancellation and refund workflow. Connect each provider using actual credentials and verify its production behavior. Replace the sample metrics and review the concept photography against real product photos. Supply final business policies and legal copy.
