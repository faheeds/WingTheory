# Build decisions

- Used Next.js, React and strict TypeScript from the handoff. CSS tokens live in `src/app/globals.css`. The prototype is a visual reference, not application code.
- Used local browser storage to make capacity, availability, cart and order state visible across customer and operator routes without pretending that a server or provider connection exists.
- Checkout is explicitly a demo. It creates an unpaid sample order and never accepts card details.
- The generated hero photograph follows the handoff's lighting and composition direction. Other photo areas remain labeled slots because no approved production photography was supplied.
- The remaining operator navigation pages show demo overviews. Real finance, staff, customer, inventory and marketing operations need a server, access controls and verified data.
- No customer location picker or location performance view is included. Kitchen capacity is internal to the operator area.
- The prototype's Uber Eats sync error is shown as a setup requirement in this build because no provider account is connected. This keeps integration status truthful.
