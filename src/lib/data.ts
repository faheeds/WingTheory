export type MenuItem = {
  id: string;
  no: string;
  name: string;
  category: string;
  description: string;
  price: number;
  heat: number;
  tags: string[];
};
export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";
export type Order = {
  id: string;
  customer: string;
  channel: "Direct" | "DoorDash" | "Uber Eats" | "Grubhub";
  items: number;
  note: string;
  total: number;
  age: number;
  promised: number;
  status: OrderStatus;
};
export type CartItem = {
  key: string;
  itemId: string;
  name: string;
  quantity: number;
  pieces?: number;
  chicken?: string;
  sauces?: string[];
  crispiness?: string;
  sauceLevel?: string;
  dips?: string[];
  instructions?: string;
  heat?: number;
  unitPrice: number;
};

export const categories = [
  "All",
  "Signature Wings",
  "Bone-In Wings",
  "Boneless Wings",
  "Chicken Tenders",
  "Chicken Sandwiches",
  "Loaded Fries",
  "Sides",
  "Dips",
  "Desserts",
  "Drinks",
  "Combos",
  "Family Packs",
  "Catering",
];
export const filters = [
  "Popular",
  "New",
  "Mild",
  "Medium",
  "Hot",
  "Extreme",
  "Vegetarian sides",
  "Gluten-aware",
];
export const heatNames = [
  "No Heat",
  "Mild",
  "Medium",
  "Hot",
  "Fire",
  "Theory Breaker",
];
export const heatCopy = [
  "All flavor, zero burn.",
  "A warm hello.",
  "Noticeable, friendly.",
  "The house standard.",
  "Sweat is expected.",
  "Proceed with courage.",
];
export const heatColors = [
  "#8A8E98",
  "#C6FF3D",
  "#E3F53A",
  "#FF8A1F",
  "#FF5A5A",
  "#FF3D8B",
];
export const quantityOptions = [6, 10, 15, 20, 30, 50];
export const quantityPrices = [9.99, 15.99, 22.99, 29.99, 43.99, 69.99];
export const capacityOptions = {
  NORMAL: {
    eta: "28–36 min",
    short: "28–36 MIN",
    note: "Quoted delivery ETA 28–36 min on all channels.",
  },
  BUSY: {
    eta: "40–48 min",
    short: "40–48 MIN",
    note: "ETA +12 min on all channels.",
  },
  "VERY BUSY": {
    eta: "55–63 min",
    short: "55–63 MIN",
    note: "ETA +27 min. Marketplace throttling on.",
  },
  PAUSED: {
    eta: "Ordering paused",
    short: "PAUSED",
    note: "Direct ordering off. Marketplace pause requires a connected provider.",
  },
} as const;
export type Capacity = keyof typeof capacityOptions;
export const stages = [
  "Order received",
  "Confirmed",
  "Wings in the lab",
  "Sauced",
  "Packed",
  "Out for delivery",
  "Delivered",
];
export const stageCopy = [
  "ORDER RECEIVED.",
  "THE THEORY IS IN MOTION.",
  "YOUR THEORY IS GETTING CRISPY.",
  "YOUR THEORY IS GETTING SAUCED.",
  "PACKED. SEALED. LEAVING.",
  "ON THE MOVE.",
  "THE RESULTS ARE IN.",
];
export const channelColors = {
  Direct: "#C6FF3D",
  DoorDash: "#FF6A1F",
  "Uber Eats": "#3D6BFF",
  Grubhub: "#FF3D8B",
};

export const items: MenuItem[] = [
  {
    id: "hh",
    no: "THEORY NO.07",
    name: "Hot Honey Wings",
    category: "Signature Wings",
    description: "Wildflower honey, chili flake, lemon zest.",
    price: 13.49,
    heat: 3,
    tags: ["Popular"],
  },
  {
    id: "kf",
    no: "THEORY NO.09",
    name: "Korean Fire Wings",
    category: "Signature Wings",
    description: "Gochujang glaze, toasted sesame, scallion.",
    price: 13.99,
    heat: 4,
    tags: ["Popular"],
  },
  {
    id: "ni",
    no: "THEORY NO.04",
    name: "Nashville Inferno",
    category: "Signature Wings",
    description: "Ghost pepper oil, brown sugar, dill pickle.",
    price: 13.99,
    heat: 5,
    tags: [],
  },
  {
    id: "x12",
    no: "EXPERIMENT 12",
    name: "Mango Habanero × Tajín",
    category: "Signature Wings",
    description: "Limited run. Mango glaze, habanero, chili-lime dust.",
    price: 14.49,
    heat: 4,
    tags: ["New"],
  },
  {
    id: "lp",
    no: "THEORY NO.03",
    name: "Lemon Pepper Wings",
    category: "Bone-In Wings",
    description: "Cracked pepper, lemon, brown butter.",
    price: 12.99,
    heat: 1,
    tags: ["Gluten-aware"],
  },
  {
    id: "gp",
    no: "THEORY NO.02",
    name: "Garlic Parmesan Wings",
    category: "Bone-In Wings",
    description: "Roasted garlic, aged parmesan, parsley.",
    price: 12.99,
    heat: 0,
    tags: ["Popular"],
  },
  {
    id: "bb",
    no: "THEORY NO.01",
    name: "Classic Buffalo Boneless",
    category: "Boneless Wings",
    description: "Aged cayenne, cultured butter.",
    price: 11.99,
    heat: 2,
    tags: [],
  },
  {
    id: "fs",
    no: "",
    name: "Fire Chicken Sandwich",
    category: "Chicken Sandwiches",
    description: "Nashville thigh, slaw, pickles, brioche.",
    price: 11.99,
    heat: 3,
    tags: ["New"],
  },
  {
    id: "lf",
    no: "",
    name: "Loaded Theory Fries",
    category: "Loaded Fries",
    description: "Cheese sauce, pickled jalapeño, crispy chicken.",
    price: 8.49,
    heat: 2,
    tags: ["Popular"],
  },
  {
    id: "sf",
    no: "",
    name: "Seasoned Fries",
    category: "Sides",
    description: "Theory dust, sea salt.",
    price: 4.49,
    heat: 0,
    tags: ["Vegetarian sides", "Gluten-aware"],
  },
  {
    id: "mc",
    no: "",
    name: "Three-Cheese Mac",
    category: "Sides",
    description: "Sharp cheddar, gruyère, toasted crumbs.",
    price: 4.99,
    heat: 0,
    tags: ["Vegetarian sides"],
  },
  {
    id: "ct",
    no: "",
    name: "Chicken Tenders",
    category: "Chicken Tenders",
    description: "Buttermilk brined, hand breaded.",
    price: 10.99,
    heat: 0,
    tags: [],
  },
  {
    id: "sr",
    no: "",
    name: "Spicy Ranch",
    category: "Dips",
    description: "Creamy ranch, chili, fresh herbs.",
    price: 0.99,
    heat: 1,
    tags: [],
  },
  {
    id: "bc",
    no: "",
    name: "Blue Cheese Dip",
    category: "Dips",
    description: "Tangy blue cheese, buttermilk, chives.",
    price: 1.25,
    heat: 0,
    tags: [],
  },
  {
    id: "ck",
    no: "",
    name: "Brown Butter Cookie",
    category: "Desserts",
    description: "Chocolate chunks, brown butter, flaky salt.",
    price: 3.49,
    heat: 0,
    tags: [],
  },
  {
    id: "br",
    no: "",
    name: "Fudge Brownie",
    category: "Desserts",
    description: "Deep chocolate, crackly top, fudgy center.",
    price: 4.49,
    heat: 0,
    tags: [],
  },
  {
    id: "ys",
    no: "",
    name: "Yuzu Soda",
    category: "Drinks",
    description: "Bright yuzu citrus, sparkling finish.",
    price: 3.49,
    heat: 0,
    tags: [],
  },
  {
    id: "hl",
    no: "",
    name: "House Lemonade",
    category: "Drinks",
    description: "Fresh lemon, just sweet enough.",
    price: 3.49,
    heat: 0,
    tags: [],
  },
  {
    id: "hc",
    no: "",
    name: "Hot Honey Combo",
    category: "Combos",
    description: "Six Hot Honey wings, seasoned fries, ranch.",
    price: 16.99,
    heat: 3,
    tags: ["Popular"],
  },
  {
    id: "fc",
    no: "",
    name: "Fire Sandwich Combo",
    category: "Combos",
    description: "Fire Chicken Sandwich, seasoned fries, lemonade.",
    price: 15.99,
    heat: 3,
    tags: [],
  },
  {
    id: "wp",
    no: "",
    name: "20-Piece Wing Pack",
    category: "Family Packs",
    description: "Twenty mixed wings, large seasoned fries, two dips.",
    price: 37.99,
    heat: 2,
    tags: [],
  },
  {
    id: "tp",
    no: "",
    name: "Tender Family Pack",
    category: "Family Packs",
    description: "Twelve chicken tenders, large fries, two dips.",
    price: 33.99,
    heat: 0,
    tags: [],
  },
  {
    id: "wt",
    no: "",
    name: "50-Wing Catering Tray",
    category: "Catering",
    description: "Fifty mixed wings, dips on the side. 24-hour notice required.",
    price: 79.99,
    heat: 2,
    tags: [],
  },
  {
    id: "tt",
    no: "",
    name: "Tender Catering Tray",
    category: "Catering",
    description: "Thirty chicken tenders, three dips. 24-hour notice required.",
    price: 69.99,
    heat: 0,
    tags: [],
  },
];

export const itemImages: Record<string, string> = {
  hh: "/images/menu/hot-honey-wings.webp",
  kf: "/images/menu/korean-fire-wings.webp",
  ni: "/images/menu/nashville-inferno.webp",
  x12: "/images/menu/mango-habanero-tajin.webp",
  lp: "/images/menu/lemon-pepper-wings.webp",
  gp: "/images/menu/garlic-parmesan-wings.webp",
  bb: "/images/menu/classic-buffalo-boneless.webp",
  fs: "/images/menu/fire-chicken-sandwich.webp",
  lf: "/images/menu/loaded-theory-fries.webp",
  sf: "/images/menu/seasoned-fries.webp",
  mc: "/images/menu/three-cheese-mac.webp",
  ct: "/images/menu/chicken-tenders.webp",
  sr: "/images/menu/spicy-ranch.webp",
  bc: "/images/menu/blue-cheese.webp",
  ck: "/images/menu/brown-butter-cookie.webp",
  br: "/images/menu/fudge-brownie.webp",
  ys: "/images/menu/yuzu-soda.webp",
  hl: "/images/menu/house-lemonade.webp",
  hc: "/images/menu/hot-honey-combo.webp",
  fc: "/images/menu/fire-sandwich-combo.webp",
  wp: "/images/menu/twenty-wing-pack.webp",
  tp: "/images/menu/tender-family-pack.webp",
  wt: "/images/menu/wing-catering-tray.webp",
  tt: "/images/menu/tender-catering-tray.webp",
};

export const seedOrders: Order[] = [
  {
    id: "2053",
    customer: "Jordan K.",
    channel: "Direct",
    items: 3,
    note: "EXTRA CRISPY · NO RANCH",
    total: 34.2,
    age: 1,
    promised: 28,
    status: "NEW",
  },
  {
    id: "2052",
    customer: "Priya S.",
    channel: "DoorDash",
    items: 5,
    note: "",
    total: 58.75,
    age: 3,
    promised: 28,
    status: "NEW",
  },
  {
    id: "2049",
    customer: "Alex M.",
    channel: "Uber Eats",
    items: 2,
    note: "ALLERGY: SESAME",
    total: 22.1,
    age: 11,
    promised: 25,
    status: "PREPARING",
  },
  {
    id: "2048",
    customer: "Sam T.",
    channel: "Direct",
    items: 4,
    note: "2 × HOT HONEY · 1 × KOREAN FIRE",
    total: 41.6,
    age: 19,
    promised: 21,
    status: "PREPARING",
  },
  {
    id: "2046",
    customer: "Dana R.",
    channel: "Grubhub",
    items: 1,
    note: "",
    total: 15.49,
    age: 17,
    promised: 18,
    status: "READY",
  },
  {
    id: "2044",
    customer: "Chris L.",
    channel: "DoorDash",
    items: 6,
    note: "Leave at door",
    total: 72.3,
    age: 24,
    promised: 34,
    status: "OUT_FOR_DELIVERY",
  },
];

export const money = (value: number) => `$${value.toFixed(2)}`;
export const isWingItem = (item: MenuItem) => item.category.endsWith("Wings");
export const priceForItem = (
  item: MenuItem,
  pieces: number,
  extraCrispy = false,
  dipCount = 0,
) => {
  if (!isWingItem(item)) return item.price;
  const index = quantityOptions.indexOf(pieces);
  if (index < 0) throw new Error("Unsupported quantity");
  const cents =
    Math.round(item.price * 100) +
    Math.round((quantityPrices[index] - quantityPrices[0]) * 100) +
    (extraCrispy ? 100 : 0) +
    dipCount * 125;
  return cents / 100;
};
export const checkoutTotals = (
  cart: CartItem[],
  tipRate: number,
  rewardUsed: boolean,
) => {
  const subtotalCents = cart.reduce(
    (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  );
  const deliveryCents = 299;
  const taxCents = Math.round(subtotalCents * 0.1035);
  const tipCents = Math.round(subtotalCents * tipRate);
  const rewardCents = rewardUsed ? 500 : 0;
  return {
    subtotal: subtotalCents / 100,
    delivery: deliveryCents / 100,
    tax: taxCents / 100,
    tip: tipCents / 100,
    reward: rewardCents / 100,
    total:
      Math.max(
        0,
        subtotalCents + deliveryCents + taxCents + tipCents - rewardCents,
      ) / 100,
  };
};
export const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll("&", "and")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
export const itemPath = (item: MenuItem) =>
  `/menu/${slug(item.category)}/${slug(item.name)}`;
