"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Flame,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Truck,
  Check,
  Clock3,
  CreditCard,
  Gift,
  UserRound,
  Heart,
  X,
} from "lucide-react";
import {
  capacityOptions,
  categories,
  checkoutTotals,
  filters,
  heatColors,
  heatCopy,
  heatNames,
  itemPath,
  itemImages,
  items,
  money,
  quantityOptions,
  priceForItem,
  isWingItem,
  slug,
  stageCopy,
  stages,
  type MenuItem,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { canRequestCancellation, trackingStage } from "@/lib/order-machine";

function Photo({
  label,
  src,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  label: string;
  src: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`photo-slot ${className}`}>
      <Image src={src} alt={label} fill sizes={sizes} className="food-photo" />
    </div>
  );
}
function SectionHeader({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}
function HeatMeter({ heat }: { heat: number }) {
  return (
    <div
      className="heat-meter"
      aria-label={`Heat ${heat} of 5: ${heatNames[heat]}`}
    >
      {heatColors.slice(1).map((color, index) => (
        <span
          key={color}
          style={{ background: index < heat ? color : "var(--line)" }}
        />
      ))}
    </div>
  );
}
function DeliveryEta() {
  const { capacity } = useStore();
  return (
    <span className="eta">
      <span className="live-dot" /> KITCHEN · {capacity}{" "}
      <b>{capacityOptions[capacity].eta}</b>
    </span>
  );
}
function AddButton({
  item,
  compact = false,
}: {
  item: MenuItem;
  compact?: boolean;
}) {
  const { addItem, soldIds, capacity } = useStore();
  const sold = soldIds.includes(item.id);
  const disabled = sold || capacity === "PAUSED";
  return (
    <button
      className={`button ${compact ? "quick-add" : "primary"}`}
      disabled={disabled}
      onClick={() =>
        addItem({
          key: `${item.id}-${Date.now()}`,
          itemId: item.id,
          name: item.name,
          quantity: 1,
          ...(isWingItem(item)
            ? {
                pieces: 6,
                chicken: "Bone-In",
                sauces: [item.name],
                crispiness: "Classic",
                heat: item.heat,
              }
            : {}),
          unitPrice: item.price,
        })
      }
      aria-label={
        sold
          ? `${item.name} sold out`
          : capacity === "PAUSED"
            ? "Ordering paused"
            : `Add ${item.name} to cart`
      }
    >
      {compact ? (
        disabled ? (
          <X size={18} />
        ) : (
          <Plus size={20} />
        )
      ) : sold ? (
        "Sold out"
      ) : capacity === "PAUSED" ? (
        "Paused"
      ) : (
        "+ Add"
      )}
    </button>
  );
}

function HomePage() {
  const { capacity } = useStore();
  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow drop-label">
              <span className="magenta-dot" /> DROP 12 LIVE · MANGO HABANERO ×
              TAJÍN
            </p>
            <h1>
              WINGS, ENGINEERED TO <em>OBSESSION.</em>
            </h1>
            <p className="hero-sub">
              Crispy wings. Original sauces. Zero boring bites.
            </p>
            <div className="hero-actions">
              <Link href="/menu" className="button primary">
                ORDER YOUR THEORY <ArrowRight size={19} />
              </Link>
              <Link href="/menu" className="button outline">
                EXPLORE THE MENU
              </Link>
            </div>
          </div>
          <div className="delivery-card">
            <label className="eyebrow" htmlFor="hero-address">
              DELIVER TO
            </label>
            <div className="address-row">
              <MapPin size={20} />
              <input
                id="hero-address"
                placeholder="Enter your delivery address"
                aria-label="Delivery address"
              />
              <ChevronRight size={18} />
            </div>
            <div className="delivery-details">
              <span>KITCHEN · {capacity}</span>
              <strong>{capacityOptions[capacity].short}</strong>
            </div>
            <p>
              Also on DoorDash · Uber Eats · Grubhub. Order direct to earn
              Theory Club points.
            </p>
          </div>
        </div>
      </section>
      <div className="mobile-delivery">
        <DeliveryEta />
        <label>
          DELIVER TO
          <input
            placeholder="Enter your delivery address"
            aria-label="Delivery address"
          />
        </label>
      </div>
      <section className="section home-section">
        <SectionHeader
          kicker="OUR SAUCES. YOUR OBSESSION."
          title="FLAVOR THEORY"
          sub="Original flavors. Obsessively crafted. Find your theory."
        />
        <div className="flavor-grid">
          {[
            {
              n: "NO.01",
              name: "CLASSIC BUFFALO",
              heat: 2,
              notes: "Cayenne · butter · vinegar",
              balance: "SWEET ▪▫▫▫▫ · SAVORY ▪▪▪▪▫",
              href: "/menu/boneless-wings/classic-buffalo-boneless",
            },
            {
              n: "NO.04",
              name: "NASHVILLE INFERNO",
              heat: 5,
              notes: "Ghost pepper · brown sugar · pickle",
              balance: "SWEET ▪▪▫▫▫ · SAVORY ▪▪▪▪▪",
              featured: true,
              href: itemPath(items[2]),
            },
            {
              n: "NO.07",
              name: "HOT HONEY THEORY",
              heat: 3,
              notes: "Honey · chili flake · lemon",
              balance: "SWEET ▪▪▪▪▪ · SAVORY ▪▪▫▫▫",
              href: itemPath(items[0]),
            },
            {
              n: "NO.09",
              name: "KOREAN FIRE",
              heat: 4,
              notes: "Gochujang · sesame · scallion",
              balance: "SWEET ▪▪▪▫▫ · SAVORY ▪▪▪▪▫",
              href: itemPath(items[1]),
            },
          ].map((flavor) => (
            <Link
              href={flavor.href}
              className={`flavor-card ${flavor.featured ? "featured" : ""}`}
              key={flavor.n}
            >
              <span className="mono muted">
                {flavor.n} · HEAT {flavor.heat}
              </span>
              <h3>{flavor.name}</h3>
              <HeatMeter heat={flavor.heat} />
              <span className="flavor-balance">{flavor.balance}</span>
              <p>{flavor.notes}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="section home-section">
        <SectionHeader kicker="THE CROWD FAVORITES" title="BEST SELLERS" />
        <div className="best-grid">
          {[items[0], items[1], items[8]].map((item, index) => (
            <article className={`best-card best-${index}`} key={item.id}>
              <Photo
                label={item.name}
                src={itemImages[item.id]}
              />
              <div className="best-card-body">
                <span className="eyebrow">
                  {item.no || item.category.toUpperCase()}
                </span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div>
                  <strong>{money(item.price)}</strong>
                  <AddButton item={item} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section build-section">
        <SectionHeader
          kicker="SIX STEPS. INFINITE OBSESSION."
          title="BUILD YOUR THEORY"
        />
        <div className="steps-grid">
          {[
            "CHOOSE YOUR CHICKEN",
            "PICK YOUR COUNT",
            "SELECT SAUCES",
            "SET THE HEAT",
            "MAKE IT CRISPY",
            "ADD THE EXTRAS",
          ].map((step, index) => (
            <div className="step" key={step}>
              <span>0{index + 1}</span>
              <h3>{step}</h3>
            </div>
          ))}
        </div>
        <Link href="/build" className="button primary">
          BUILD YOUR ORDER <ArrowRight size={18} />
        </Link>
      </section>
      <section className="section promo-grid">
        <Link href="/drops" className="promo promo-drop">
          <span className="eyebrow">EXPERIMENT 12 · LIMITED DROP</span>
          <h2>MANGO HABANERO × TAJÍN</h2>
          <p>Sweet. Heat. A little chaos.</p>
          <span className="text-link">
            EXPLORE THE DROP <ArrowRight size={18} />
          </span>
        </Link>
        <Link href="/rewards" className="promo">
          <span className="eyebrow">EVERY BITE COUNTS</span>
          <h2>THEORY CLUB</h2>
          <p>
            Earn points when you order direct. Unlock rewards and exclusive
            drops.
          </p>
          <span className="text-link">
            JOIN THE CLUB <ArrowRight size={18} />
          </span>
        </Link>
        <Link href="/catering" className="promo">
          <span className="eyebrow">FEED THE WHOLE CREW</span>
          <h2>CATERING</h2>
          <p>Big flavor for the whole team. Delivered.</p>
          <span className="text-link">
            PLAN YOUR ORDER <ArrowRight size={18} />
          </span>
        </Link>
      </section>
      <section className="section social-section">
        <SectionHeader kicker="A CLOSER LOOK" title="THE LINEUP" />
        <div className="social-grid">
          {[items[0], items[1], items[3], items[8], items[7]].map((item) => (
            <Photo key={item.id} label={item.name} src={itemImages[item.id]} />
          ))}
        </div>
      </section>
    </>
  );
}

function MenuPage({ categorySlug }: { categorySlug?: string }) {
  const [category, setCategory] = useState(
    categorySlug
      ? categories.find((x) => slug(x) === categorySlug) || "All"
      : "All",
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const { soldIds, capacity, cart } = useStore();
  const shown = items.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      item.name.toLowerCase().includes(query.toLowerCase()) &&
      selected.every((filter) =>
        filter === "Mild"
          ? item.heat <= 1
          : filter === "Medium"
            ? item.heat === 2
            : filter === "Hot"
              ? item.heat === 3 || item.heat === 4
              : filter === "Extreme"
                ? item.heat === 5
                : item.tags.includes(filter),
      ),
  );
  return (
    <div className="page-wrap menu-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">FIND YOUR NEXT OBSESSION</p>
          <h1>THE MENU.</h1>
        </div>
        <DeliveryEta />
      </div>
      <div className="menu-tools">
        <label className="search-box">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the menu"
            aria-label="Search menu"
          />
        </label>
        <div className="mobile-category-list">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`chip ${cat === category ? "selected" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="menu-layout">
        <aside className="category-rail" aria-label="Menu categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={cat === category ? "selected" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </aside>
        <div className="menu-content">
          <div className="filter-row">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`chip ${selected.includes(filter) ? "selected light" : ""}`}
                aria-pressed={selected.includes(filter)}
                onClick={() =>
                  setSelected((current) =>
                    current.includes(filter)
                      ? current.filter((x) => x !== filter)
                      : [...current, filter],
                  )
                }
              >
                {selected.includes(filter) ? "✓ " : ""}
                {filter}
              </button>
            ))}
          </div>
          <div className="results-header">
            <h2>{category === "All" ? "FULL MENU" : category.toUpperCase()}</h2>
            <span>{shown.length} ITEMS</span>
          </div>
          {shown.length ? (
            <div className="product-grid">
              {shown.map((item) => (
                <article
                  className={`product-card ${soldIds.includes(item.id) ? "sold" : ""}`}
                  key={item.id}
                >
                  <Link href={itemPath(item)} aria-label={`View ${item.name}`}>
                    <Photo label={item.name} src={itemImages[item.id]} />
                    <div className="product-badges">
                      <span style={{ background: heatColors[item.heat] }}>
                        HEAT {item.heat}
                      </span>
                      {soldIds.includes(item.id) ? (
                        <span>SOLD OUT</span>
                      ) : (
                        item.tags
                          .filter((tag) => ["Popular", "New"].includes(tag))
                          .map((tag) => (
                            <span key={tag}>{tag.toUpperCase()}</span>
                          ))
                      )}
                    </div>
                  </Link>
                  <div className="product-body">
                    <span className="eyebrow">
                      {item.no || item.category.toUpperCase()}
                    </span>
                    <Link href={itemPath(item)}>
                      <h3>{item.name}</h3>
                    </Link>
                    <p>{item.description}</p>
                    <div className="product-bottom">
                      <strong>{money(item.price)}</strong>
                      <AddButton item={item} compact />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>NO MATCHES.</h3>
              <p>No items match these filters. Clear a filter to see more.</p>
              <button
                className="button outline"
                onClick={() => {
                  setSelected([]);
                  setQuery("");
                  setCategory("All");
                }}
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </div>
      {cart.length > 0 && capacity !== "PAUSED" ? (
        <Link className="sticky-cart button primary" href="/cart">
          CART · {cart.reduce((n, i) => n + i.quantity, 0)}{" "}
          <ArrowRight size={18} />
        </Link>
      ) : null}
    </div>
  );
}

function ProductPage({ item }: { item: MenuItem }) {
  const router = useRouter();
  const wing = isWingItem(item);
  const { addItem, soldIds, capacity, notify } = useStore();
  const [chicken, setChicken] = useState("Bone-In");
  const [pieces, setPieces] = useState(6);
  const [sauces, setSauces] = useState<string[]>([item.name]);
  const [heat, setHeat] = useState(item.heat);
  const [crispiness, setCrispiness] = useState("Classic");
  const [sauceLevel, setSauceLevel] = useState("Regular");
  const [dips, setDips] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const maxSauces = pieces >= 30 ? 3 : pieces >= 15 ? 2 : 1;
  const price = wing
    ? priceForItem(item, pieces, crispiness === "Extra Crispy", dips.length)
    : item.price;
  const toggleSauce = (value: string) => {
    if (sauces.includes(value)) {
      if (sauces.length > 1) setSauces(sauces.filter((x) => x !== value));
      return;
    }
    if (sauces.length >= maxSauces) {
      notify(
        `Choose up to ${maxSauces} ${maxSauces === 1 ? "sauce" : "sauces"}.`,
      );
      return;
    }
    setSauces([...sauces, value]);
  };
  const add = () => {
    addItem({
      key: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      quantity: 1,
      ...(wing
        ? { pieces, chicken, sauces, crispiness, sauceLevel, dips, heat }
        : {}),
      instructions,
      unitPrice: price,
    });
    router.push("/cart");
  };
  return (
    <div className="page-wrap product-page">
      <nav className="breadcrumbs">
        <Link href="/menu">MENU</Link>
        <ChevronRight size={14} />
        <Link href={`/menu/${slug(item.category)}`}>
          {item.category.toUpperCase()}
        </Link>
        <ChevronRight size={14} />
        {item.name.toUpperCase()}
      </nav>
      <div className="product-layout">
        <Photo
          label={item.name}
          src={itemImages[item.id]}
          className="product-hero-photo"
          sizes="(max-width: 900px) 100vw, 50vw"
        />
        <div className="customizer">
          <span className="eyebrow">
            {item.no || item.category.toUpperCase()}
          </span>
          <h1>{item.name.toUpperCase()}.</h1>
          <p className="lead">{item.description}</p>
          {wing ? (
            <>
              <div className="config-group">
                <h2>CHOOSE YOUR CHICKEN</h2>
                <div className="choice-row">
                  {["Bone-In", "Boneless", "Tenders"].map((value) => (
                    <button
                      key={value}
                      className={`choice ${chicken === value ? "selected" : ""}`}
                      onClick={() => setChicken(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="config-group">
                <div className="split-heading">
                  <h2>PICK YOUR COUNT</h2>
                  <span>
                    {maxSauces} {maxSauces === 1 ? "SAUCE" : "SAUCES"} MAX
                  </span>
                </div>
                <div className="choice-row count-row">
                  {quantityOptions.map((value) => (
                    <button
                      key={value}
                      className={`choice ${pieces === value ? "selected" : ""}`}
                      onClick={() => {
                        setPieces(value);
                        setSauces((current) =>
                          current.slice(
                            0,
                            value >= 30 ? 3 : value >= 15 ? 2 : 1,
                          ),
                        );
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="config-group">
                <h2>SELECT SAUCES</h2>
                <div className="chip-row">
                  {items
                    .filter(
                      (x) =>
                        x.category === "Signature Wings" ||
                        x.category === "Bone-In Wings",
                    )
                    .map((sauce) => (
                      <button
                        key={sauce.id}
                        className={`chip ${sauces.includes(sauce.name) ? "selected" : ""}`}
                        aria-pressed={sauces.includes(sauce.name)}
                        onClick={() => toggleSauce(sauce.name)}
                      >
                        {sauce.name}
                      </button>
                    ))}
                </div>
              </div>
              <div className="config-group">
                <div className="split-heading">
                  <h2>SET THE HEAT</h2>
                  <span style={{ color: heatColors[heat] }}>
                    {heatNames[heat].toUpperCase()}
                  </span>
                </div>
                <div className="heat-choices">
                  {heatNames.map((name, index) => (
                    <button
                      key={name}
                      className={heat === index ? "selected" : ""}
                      aria-label={`Heat ${index}: ${name}`}
                      aria-pressed={heat === index}
                      onClick={() => setHeat(index)}
                      style={
                        {
                          "--heat-color": heatColors[index],
                        } as React.CSSProperties
                      }
                    >
                      {index}
                    </button>
                  ))}
                </div>
                <div className="heat-gradient" />
                <p className="help-text">{heatCopy[heat]}</p>
              </div>
              <div className="config-group">
                <h2>CRISPINESS</h2>
                <div className="choice-row">
                  {["Classic", "Extra Crispy"].map((value) => (
                    <button
                      key={value}
                      className={`choice ${crispiness === value ? "selected" : ""}`}
                      onClick={() => setCrispiness(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="config-group">
                <h2>SAUCE LEVEL</h2>
                <div className="choice-row">
                  {["Light", "Regular", "Extra Saucy"].map((value) => (
                    <button
                      key={value}
                      className={`choice ${sauceLevel === value ? "selected" : ""}`}
                      onClick={() => setSauceLevel(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="config-group">
                <h2>DIPS</h2>
                <div className="chip-row">
                  {["Ranch", "Blue Cheese", "Hot Honey", "Garlic Aioli"].map(
                    (value) => (
                      <button
                        key={value}
                        className={`chip ${dips.includes(value) ? "selected" : ""}`}
                        aria-pressed={dips.includes(value)}
                        onClick={() =>
                          setDips((current) =>
                            current.includes(value)
                              ? current.filter((x) => x !== value)
                              : [...current, value],
                          )
                        }
                      >
                        {value} · $1.25
                      </button>
                    ),
                  )}
                </div>
              </div>
            </>
          ) : null}
          <div className="config-group">
            <label htmlFor="instructions">SPECIAL INSTRUCTIONS</label>
            <textarea
              id="instructions"
              maxLength={140}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Anything the kitchen should know?"
            />
            <p className="help-text">
              For allergies, contact support before ordering.{" "}
              {instructions.length}/140
            </p>
          </div>
          <button
            className="button primary add-order"
            disabled={soldIds.includes(item.id) || capacity === "PAUSED"}
            onClick={add}
          >
            {soldIds.includes(item.id)
              ? "SOLD OUT"
              : capacity === "PAUSED"
                ? "ORDERING PAUSED"
                : `ADD TO ORDER · ${money(price)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  const { cart, changeQuantity, capacity } = useStore();
  const { subtotal } = checkoutTotals(cart, 0, false);
  return (
    <div className="page-wrap cart-page">
      <p className="eyebrow">ALMOST THERE</p>
      <h1>YOUR ORDER.</h1>
      {cart.length ? (
        <div className="checkout-layout">
          <div>
            <h2>THE GOOD STUFF</h2>
            <div className="cart-items">
              {cart.map((item) => (
                <article key={item.key} className="cart-item">
                  <Photo label={item.name} src={itemImages[item.itemId]} sizes="96px" />
                  <div>
                    <h3>{item.name}</h3>
                    {items.some(
                      (product) =>
                        product.id === item.itemId && isWingItem(product),
                    ) ? (
                      <p>
                        {item.pieces} pieces · {item.chicken} ·{" "}
                        {item.sauces?.join(" + ")} · {item.crispiness}
                        {item.sauceLevel ? ` · ${item.sauceLevel}` : ""}
                        {item.dips?.length
                          ? ` · Dips: ${item.dips.join(", ")}`
                          : ""}
                      </p>
                    ) : null}
                    {item.instructions ? (
                      <p className="help-text">Note: {item.instructions}</p>
                    ) : null}
                    <div className="stepper">
                      <button
                        aria-label={`Remove one ${item.name}`}
                        onClick={() => changeQuantity(item.key, -1)}
                      >
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label={`Add one ${item.name}`}
                        onClick={() => changeQuantity(item.key, 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <strong>{money(item.quantity * item.unitPrice)}</strong>
                </article>
              ))}
            </div>
            <h2>COMPLETE THE THEORY</h2>
            <div className="chip-row">
              {items
                .filter((x) => ["sf", "mc", "lf"].includes(x.id))
                .map((x) => (
                  <Link key={x.id} className="chip" href={itemPath(x)}>
                    + {x.name}
                  </Link>
                ))}
            </div>
          </div>
          <aside className="summary-card">
            <h2>ORDER SUMMARY</h2>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>Delivery fee</span>
              <span>$2.99</span>
            </div>
            <div className="summary-total">
              <span>ESTIMATED TOTAL</span>
              <strong>{money(subtotal + 2.99)}</strong>
            </div>
            <p className="help-text">
              Tax and optional tip are calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className={`button primary full ${capacity === "PAUSED" ? "disabled" : ""}`}
              aria-disabled={capacity === "PAUSED"}
            >
              CHECKOUT <ArrowRight size={18} />
            </Link>
            {capacity === "PAUSED" ? (
              <p className="warning-text">Ordering paused by the kitchen.</p>
            ) : null}
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingBag size={38} />
          <h2>YOUR CART IS HUNGRY.</h2>
          <p>Let’s find your first obsession.</p>
          <Link className="button primary" href="/menu">
            EXPLORE THE MENU
          </Link>
        </div>
      )}
    </div>
  );
}

function CheckoutPage() {
  const router = useRouter();
  const { cart, capacity, placeDemoOrder, rewardPoints } = useStore();
  const stripeTest = process.env.NEXT_PUBLIC_CHECKOUT_MODE === "stripe_test";
  const [schedule, setSchedule] = useState(false);
  const [tip, setTip] = useState(0.18);
  const [reward, setReward] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("Card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const {
    subtotal,
    tax,
    tip: tipAmount,
    total,
  } = checkoutTotals(cart, tip, reward);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cart.length || capacity === "PAUSED") {
      setError("Ordering is currently unavailable.");
      return;
    }
    if (!name.trim() || !address.trim() || !email.trim() || !phone.trim() ||
        (stripeTest && (!city.trim() || !postalCode.trim()))) {
      setError("Complete delivery and contact details first.");
      return;
    }
    if (stripeTest) {
      setSubmitting(true);
      setError("");
      try {
        const response = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart, name, email, phone, street: address, apartment,
            city, state: "WA", postalCode, instructions,
          }),
        });
        const result: { url?: string; error?: string } = await response.json();
        if (!response.ok || !result.url) {
          setError(result.error ?? "Checkout could not start. Please try again.");
          return;
        }
        window.location.assign(result.url);
      } catch {
        setError("Checkout could not start. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const id = placeDemoOrder(name, total, reward);
    router.push(`/order/${id}/confirmation`);
  };
  return (
    <form className="page-wrap checkout-page" onSubmit={submit}>
      <p className="eyebrow">THE FINAL STEP</p>
      <h1>CHECKOUT.</h1>
      <p className="demo-notice">
        {stripeTest
          ? "Stripe test checkout only. No real charge is made and no food is delivered."
          : "Demo checkout. No payment is collected and no food is delivered."}
      </p>
      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="guest-banner">
            Checking out as a guest? <Link href="/account">Sign in</Link> to
            earn Theory Club points.
          </div>
          <section className="form-section">
            <h2>
              <span>01</span> DELIVERY
            </h2>
            <label>
              Delivery address
              <input
                required
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder={stripeTest ? "Street address" : "Street address, city, ZIP"}
              />
            </label>
            {stripeTest ? (
              <>
                <label>
                  Apartment or unit
                  <input value={apartment} onChange={(event) => setApartment(event.target.value)} />
                </label>
                <div className="form-grid">
                  <label>
                    City
                    <input required value={city} onChange={(event) => setCity(event.target.value)} />
                  </label>
                  <label>
                    Washington ZIP
                    <input required inputMode="numeric" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
                  </label>
                </div>
              </>
            ) : null}
            <label>
              Drop-off instructions
              <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Gate code, building, or delivery notes" />
            </label>
            {!stripeTest ? <div className="choice-row">
              <button
                type="button"
                className={`choice ${!schedule ? "selected" : ""}`}
                onClick={() => setSchedule(false)}
              >
                ASAP <small>{capacityOptions[capacity].eta}</small>
              </button>
              <button
                type="button"
                className={`choice ${schedule ? "selected" : ""}`}
                onClick={() => setSchedule(true)}
              >
                Schedule <small>Pick a time today or later</small>
              </button>
            </div> : null}
            {!stripeTest && schedule ? (
              <label>
                Delivery time
                <input type="datetime-local" required />
              </label>
            ) : null}
          </section>
          <section className="form-section">
            <h2>
              <span>02</span> CONTACT
            </h2>
            <div className="form-grid">
              <label>
                Name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label>
                Mobile
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(555) 000-0000"
                />
              </label>
            </div>
            <label>
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </section>
          <section className="form-section">
            <h2>
              <span>03</span> PAYMENT
            </h2>
            {!stripeTest ? <div className="choice-row payment-row">
              {["Card", "Apple Pay", "Google Pay", "PayPal", "Gift card"].map(
                (value) => (
                  <button
                    type="button"
                    key={value}
                    className={`choice ${payment === value ? "selected" : ""}`}
                    onClick={() => setPayment(value)}
                  >
                    {value}
                  </button>
                ),
              )}
            </div> : null}
            <p className="help-text">
              {stripeTest
                ? "You will choose a test payment method on Stripe. Do not use a real card."
                : "Payment methods require a live payment connection. This demo creates an unpaid sample order only. Never enter card details here."}
            </p>
          </section>
        </div>
        <aside className="summary-card">
          <h2>YOUR THEORY</h2>
          {cart.map((item) => (
            <div key={item.key} className="summary-line">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{money(item.quantity * item.unitPrice)}</span>
            </div>
          ))}
          <div className="chip-row upsell-row">
            {items
              .filter((x) => ["sf", "mc"].includes(x.id))
              .map((x) => (
                <Link key={x.id} className="chip" href={itemPath(x)}>
                  + {x.name}
                </Link>
              ))}
          </div>
          {!stripeTest ? <label>
            Promo code
            <input placeholder="Enter code" />
          </label> : null}
          {!stripeTest ? <h3>TIP YOUR DRIVER</h3> : null}
          {!stripeTest ? <div className="choice-row tip-row">
            {[0, 0.15, 0.18, 0.2].map((value) => (
              <button
                type="button"
                key={value}
                className={`choice ${tip === value ? "selected" : ""}`}
                onClick={() => setTip(value)}
              >
                {value ? `${Math.round(value * 100)}%` : "None"}
              </button>
            ))}
          </div> : null}
          {!stripeTest ? <label className="reward-toggle">
            <input
              type="checkbox"
              checked={reward}
              disabled={rewardPoints < 500}
              onChange={(event) => setReward(event.target.checked)}
            />{" "}
            Use 500 pts for $5 off
          </label> : null}
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          {!stripeTest ? <div className="summary-line">
            <span>Delivery fee</span>
            <span>$2.99</span>
          </div> : null}
          {!stripeTest ? <div className="summary-line">
            <span>Estimated tax</span>
            <span>{money(tax)}</span>
          </div> : null}
          {!stripeTest ? <div className="summary-line">
            <span>Tip</span>
            <span>{money(tipAmount)}</span>
          </div> : null}
          {reward ? (
            <div className="summary-line volt-text">
              <span>Theory Club reward</span>
              <span>−$5.00</span>
            </div>
          ) : null}
          {stripeTest ? <p className="help-text">Delivery and tax are calculated before you confirm payment on Stripe.</p> : null}
          {!stripeTest ? <div className="summary-total">
            <span>TOTAL</span>
            <strong>{money(total)}</strong>
          </div> : null}
          {error ? (
            <p className="error-text" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="button primary full"
            disabled={!cart.length || capacity === "PAUSED" || submitting}
          >
            {stripeTest ? (submitting ? "CHECKING DELIVERY…" : "CONTINUE TO STRIPE TEST CHECKOUT") : `CREATE DEMO ORDER · ${money(total)}`}
          </button>
        </aside>
      </div>
    </form>
  );
}

function TrackingPage({
  id,
  confirmation = false,
}: {
  id: string;
  confirmation?: boolean;
}) {
  const { orders, advanceOrder, notify, ready } = useStore();
  const order = orders.find((x) => x.id === id);
  if (!ready) {
    return (
      <div className="page-wrap tracking-page">
        <p className="eyebrow">ORDER #{id}</p>
        <h1>CHECKING YOUR ORDER.</h1>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="page-wrap tracking-page">
        <p className="eyebrow">ORDER #{id}</p>
        <h1>ORDER NOT FOUND.</h1>
        <p className="lead">
          Check the link or return to your account to view demo orders saved in
          this browser.
        </p>
        <Link href="/account/orders" className="button primary">
          VIEW DEMO ORDERS
        </Link>
      </div>
    );
  }
  const current = trackingStage(order.status);
  const terminal =
    order?.status === "CANCELLED" || order?.status === "REJECTED";
  return (
    <div className="page-wrap tracking-page">
      <p className="eyebrow">
        ORDER #{id} ·{" "}
        {confirmation ? "DEMO ORDER CREATED" : "LIVE TRACKING DEMO"}
      </p>
      <h1>{terminal ? `ORDER ${order.status}.` : stageCopy[current]}</h1>
      <p className="lead">
        {terminal
          ? "This demo order is closed."
          : current === 6
            ? "Your order has arrived."
            : `Estimated arrival in ${[34, 32, 26, 20, 16, 9][current]} min.`}
      </p>
      <div className="tracking-layout">
        <div className="tracking-main">
          <div className="progress-segments">
            {stages.map((value, index) => (
              <span key={value} className={index <= current ? "active" : ""} />
            ))}
          </div>
          <ol className="stage-list">
            {stages.map((value, index) => (
              <li key={value} className={index === current ? "current" : ""}>
                <span>
                  {index < current ? "✓" : index === current ? "●" : "○"}
                </span>
                {value}
              </li>
            ))}
          </ol>
          {current >= 5 ? (
            <div className="driver-card">
              <Truck size={25} />
              <div>
                <strong>YOUR DRIVER IS ON THE WAY</strong>
                <p>Watch for your delivery at the address provided.</p>
              </div>
            </div>
          ) : null}
          {order && canRequestCancellation(order.status) ? (
            <button
              className="text-button"
              onClick={() =>
                notify(
                  "Cancellation requested. Refunds follow restaurant review.",
                )
              }
            >
              Request cancellation
            </button>
          ) : !terminal && current < 6 ? (
            <p className="help-text">
              The kitchen has started your order. For changes or cancellation,
              contact support.
            </p>
          ) : null}
          {order && canRequestCancellation(order.status) ? (
            <p className="help-text">Refunds follow restaurant review.</p>
          ) : null}
        </div>
        <aside className="summary-card">
          <h2>ORDER #{id}</h2>
          <p>Track every step from the kitchen to your door.</p>
          <p className="demo-notice">
            Demo tracking. Operator actions in this browser update the order
            stage.
          </p>
          <div className="choice-row">
            <Link href="/operator/orders" className="button outline">
              OPEN LIVE ORDERS
            </Link>
            {order && !terminal && current < 6 ? (
              <button className="button ghost" onClick={() => advanceOrder(id)}>
                ADVANCE DEMO
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function AccountPage({ section }: { section?: string }) {
  const { rewardPoints, orders } = useStore();
  const links = [
    { label: "Recent orders", href: "/account/orders", icon: ShoppingBag },
    { label: "Favorites", href: "/account/favorites", icon: Heart },
    { label: "Saved addresses", href: "/account/addresses", icon: MapPin },
    { label: "Payment methods", href: "/account/payment", icon: CreditCard },
    { label: "Gift cards", href: "/account/gift-cards", icon: Gift },
    {
      label: "Communication preferences",
      href: "/account/preferences",
      icon: UserRound,
    },
  ];
  return (
    <div className="page-wrap account-page">
      <p className="eyebrow">THEORY CLUB MEMBER</p>
      <h1>
        {section ? section.replaceAll("-", " ").toUpperCase() : "YOUR ACCOUNT."}
      </h1>
      <p className="demo-notice">
        Account preview. Orders and points are stored in this browser. Sign-in
        and saved payment details are not connected yet.
      </p>
      <div className="account-grid">
        <div className="club-card">
          <span className="eyebrow">YOUR THEORY CLUB POINTS</span>
          <strong>{rewardPoints}</strong>
          <div className="progress-track">
            <span style={{ width: `${Math.min(100, rewardPoints / 10)}%` }} />
          </div>
          <p>{1000 - rewardPoints} points to your next reward.</p>
          <Link href="/rewards" className="text-link">
            EXPLORE REWARDS <ArrowRight size={18} />
          </Link>
        </div>
        <div className="account-links">
          {links.map(({ label, href, icon: Icon }) => (
            <Link href={href} key={href}>
              <Icon size={20} />
              {label}
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
      </div>
      <h2>RECENT ORDERS</h2>
      <div className="simple-list">
        {orders
          .filter((x) => x.channel === "Direct")
          .slice(0, 3)
          .map((order) => (
            <Link key={order.id} href={`/order/${order.id}/track`}>
              <span>
                #{order.id} · {order.status.replaceAll("_", " ")}
              </span>
              <strong>{money(order.total)}</strong>
            </Link>
          ))}
      </div>
    </div>
  );
}

const content: Record<
  string,
  {
    eyebrow: string;
    title: string;
    copy: string;
    action?: string;
    href?: string;
  }
> = {
  flavors: {
    eyebrow: "OUR SAUCES. YOUR OBSESSION.",
    title: "FLAVOR THEORY.",
    copy: "Every sauce begins with a question: how far can flavor go?",
    action: "EXPLORE THE MENU",
    href: "/menu",
  },
  drops: {
    eyebrow: "EXPERIMENT 12 LIVE",
    title: "LIMITED DROPS.",
    copy: "Mango Habanero × Tajín. A limited run of sweet heat and chili-lime crunch.",
    action: "ORDER THE DROP",
    href: itemPath(items[3]),
  },
  rewards: {
    eyebrow: "EARN EVERY TIME YOU ORDER DIRECT",
    title: "THEORY CLUB.",
    copy: "Order direct, earn points, unlock rewards and get first access to experimental flavors.",
    action: "START AN ORDER",
    href: "/menu",
  },
  catering: {
    eyebrow: "FEED THE WHOLE CREW",
    title: "CATERING.",
    copy: "Wings for the room. Catering delivery requires at least 24 hours notice.",
    action: "CONTACT US",
    href: "/contact",
  },
  about: {
    eyebrow: "THE METHOD BEHIND THE MADNESS",
    title: "OUR THEORY.",
    copy: "A delivery-only kitchen obsessed with crispiness, original sauces, and the perfect bite.",
  },
  faq: {
    eyebrow: "GOOD QUESTIONS",
    title: "FAQ.",
    copy: "Wing Theory is a delivery-only brand. Delivery times change with kitchen capacity and order volume.",
  },
  contact: {
    eyebrow: "WE ARE HERE TO HELP",
    title: "CONTACT.",
    copy: "For order help, include your order number when reaching out. Live support details will appear when the service is connected.",
  },
  careers: {
    eyebrow: "JOIN THE LAB",
    title: "CAREERS.",
    copy: "Interested in joining the Wing Theory crew? Hiring details are coming soon.",
  },
  blog: {
    eyebrow: "NOTES FROM THE LAB",
    title: "THE JOURNAL.",
    copy: "Stories behind our sauces and experiments are coming soon.",
  },
  allergens: {
    eyebrow: "EAT WITH CONFIDENCE",
    title: "ALLERGENS.",
    copy: "Ingredient and allergen details need kitchen verification before live ordering. If you have an allergy, contact support before placing an order.",
  },
  accessibility: {
    eyebrow: "FOR EVERYONE",
    title: "ACCESSIBILITY.",
    copy: "We want every customer to be able to explore and order. Contact us if any part of this experience is difficult to use.",
  },
  privacy: {
    eyebrow: "YOUR INFORMATION",
    title: "PRIVACY.",
    copy: "The local demo stores cart and order information in your browser. A live privacy policy will be published before launch.",
  },
  terms: {
    eyebrow: "THE DETAILS",
    title: "TERMS.",
    copy: "This is a local demo. No purchases, deliveries or payments are processed.",
  },
  "gift-cards": {
    eyebrow: "GIVE GOOD TASTE",
    title: "GIFT CARDS.",
    copy: "Gift card purchases will be available when payments are connected.",
  },
};
function InfoPage({ name }: { name: string }) {
  const info = content[name] || content.faq;
  return (
    <div className="page-wrap info-page">
      <p className="eyebrow">{info.eyebrow}</p>
      <h1>{info.title}</h1>
      <p className="lead">{info.copy}</p>
      {info.action && info.href ? (
        <Link className="button primary" href={info.href}>
          {info.action} <ArrowRight size={18} />
        </Link>
      ) : null}
      {name === "flavors" ? (
        <div className="flavor-grid">
          {items.slice(0, 6).map((item) => (
            <Link key={item.id} href={itemPath(item)} className="flavor-card">
              <span className="eyebrow">{item.no}</span>
              <h3>{item.name.toUpperCase()}</h3>
              <p>{item.description}</p>
              <HeatMeter heat={item.heat} />
            </Link>
          ))}
        </div>
      ) : null}
      {name === "rewards" ? (
        <div className="info-grid">
          {[
            ["01", "EARN POINTS", "10 points per $1 on direct orders."],
            ["02", "BIRTHDAY WINGS", "A free 6-piece on your birthday."],
            ["03", "FIRST ACCESS", "Be first in line for every limited drop."],
            ["04", "SHARE THE THEORY", "Give $10, get $10 with referrals."],
          ].map(([number, title, copy]) => (
            <article className="info-card" key={number}>
              <span className="eyebrow">{number} · THEORY CLUB</span>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      ) : null}
      {name === "catering" ? (
        <div className="info-grid catering-grid">
          {[
            ["10 TO 200", "Feed the crew, from office lunch to game night."],
            ["TRAYS BY THE 50", "Serve wings with sauces on the side."],
            ["24 HOURS", "Schedule catering delivery at least a day ahead."],
          ].map(([title, copy]) => (
            <article className="info-card" key={title}>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      ) : null}
      {name === "faq" ? (
        <div className="faq-list">
          {[
            [
              "Do you have a storefront?",
              "Wing Theory is delivery only. There is no customer pickup or dining room.",
            ],
            [
              "Can I schedule delivery?",
              "The checkout design supports ASAP and scheduled delivery. This local demo does not dispatch orders.",
            ],
            [
              "What happens when the kitchen is busy?",
              "The quoted ETA changes with kitchen capacity. The operator can also pause ordering.",
            ],
            [
              "Can I cancel my order?",
              "You may request cancellation before the kitchen starts preparation. Refunds follow restaurant review.",
            ],
            [
              "How do I earn Theory Club points?",
              "The proposed program rewards direct orders. Points and redemptions in this demo are sample data.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CustomerPage({ path }: { path: string }) {
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return <HomePage />;
  if (parts[0] === "menu") {
    if (parts.length >= 3) {
      const item = items.find((x) => slug(x.name) === parts[2]);
      return item ? (
        <ProductPage key={item.id} item={item} />
      ) : (
        <MenuPage categorySlug={parts[1]} />
      );
    }
    return <MenuPage categorySlug={parts[1]} />;
  }
  if (parts[0] === "build") return <ProductPage item={items[0]} />;
  if (parts[0] === "cart") return <CartPage />;
  if (parts[0] === "checkout") return <CheckoutPage />;
  if (parts[0] === "order" && parts[1])
    return (
      <TrackingPage id={parts[1]} confirmation={parts[2] === "confirmation"} />
    );
  if (parts[0] === "account") return <AccountPage section={parts[1]} />;
  if (parts[0] === "flavors" && parts[1]) {
    const item = items.find((x) => slug(x.name) === parts[1]);
    return item ? (
      <ProductPage key={item.id} item={item} />
    ) : (
      <InfoPage name="flavors" />
    );
  }
  return <InfoPage name={parts[0]} />;
}
