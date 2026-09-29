"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  CreditCard,
  Flame,
  LayoutDashboard,
  Menu as MenuIcon,
  Package,
  PlugZap,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Timer,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  capacityOptions,
  channelColors,
  heatColors,
  items,
  itemImages,
  money,
  priceForItem,
  type Capacity,
  type Order,
  type OrderStatus,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { posProviders, providerNames } from "@/lib/integrations";
import { BrandLogo } from "./BrandLogo";

const nav = [
  { label: "Dashboard", href: "/operator", icon: LayoutDashboard },
  { label: "Orders", href: "/operator/orders", icon: ShoppingBag },
  { label: "Kitchen", href: "/operator/kitchen", icon: Flame },
  { label: "Menu", href: "/operator/menu", icon: MenuIcon },
  { label: "Inventory", href: "/operator/inventory", icon: Package },
  { label: "Customers", href: "/operator/customers", icon: Users },
  { label: "Promotions", href: "/operator/promotions", icon: Activity },
  { label: "Theory Club", href: "/operator/theory-club", icon: Activity },
  { label: "Delivery", href: "/operator/delivery", icon: Truck },
  { label: "Catering", href: "/operator/catering", icon: CalendarDays },
  { label: "Reviews", href: "/operator/reviews", icon: Activity },
  { label: "Marketing", href: "/operator/marketing", icon: Activity },
  { label: "Analytics", href: "/operator/analytics", icon: BarChart3 },
  { label: "Finance", href: "/operator/finance", icon: CreditCard },
  { label: "Staff", href: "/operator/staff", icon: Users },
  { label: "Integrations", href: "/operator/integrations", icon: PlugZap },
  { label: "Settings", href: "/operator/settings", icon: Settings },
];
const statuses: OrderStatus[] = [
  "NEW",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
];
const statusLabels: Record<string, string> = {
  NEW: "NEW",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT FOR DELIVERY",
};
const actions: Record<string, string> = {
  NEW: "Accept",
  CONFIRMED: "Start prep",
  PREPARING: "Mark ready",
  READY: "Driver picked up",
  OUT_FOR_DELIVERY: "Complete",
};
const inColumn = (order: Order, column: OrderStatus) =>
  column === "NEW"
    ? order.status === "NEW" || order.status === "CONFIRMED"
    : order.status === column;
function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-panel ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function AdminHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="admin-header">
      <div>
        <p className="eyebrow">WING THEORY · OPERATOR</p>
        <h1>{title}</h1>
        {detail ? <p>{detail}</p> : null}
      </div>
      <div className="admin-header-right">
        <span className="live-badge">
          <span className="live-dot" /> DEMO DATA
        </span>
        <span className="mono">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
function StatusBadge({
  text,
  color = "volt",
}: {
  text: string;
  color?: string;
}) {
  return <span className={`status-badge ${color}`}>● {text}</span>;
}

function CommandCenter() {
  const { capacity, setCapacity, orders, soldIds } = useStore();
  const active = orders.filter(
    (o) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(o.status),
  );
  const late = active.filter((o) => o.promised - o.age <= 3);
  const stats = [
    { label: "REVENUE TODAY", value: "$4,286", sub: "+18.4% vs last week" },
    { label: "ORDERS", value: "127", sub: "+12 vs yesterday" },
    { label: "AVG TICKET", value: "$33.75", sub: "Across all channels" },
    { label: "ACTIVE", value: String(active.length), sub: "In the kitchen" },
    {
      label: "NEAR SLA",
      value: String(late.length),
      sub: "Needs attention",
      alert: true,
    },
    { label: "AVG PREP", value: "18m", sub: "Target 20m" },
    { label: "RATING", value: "4.8", sub: "Recent reviews" },
    { label: "CANCEL RATE", value: "1.2%", sub: "Today" },
  ];
  return (
    <>
      <AdminHeader title="COMMAND CENTER" detail="Your kitchen at a glance." />
      <div className="capacity-panel">
        <div>
          <p className="eyebrow">KITCHEN CAPACITY</p>
          <div className="capacity-options">
            {(Object.keys(capacityOptions) as Capacity[]).map((value) => (
              <button
                key={value}
                className={
                  capacity === value
                    ? `selected ${value.toLowerCase().replace(" ", "-")}`
                    : ""
                }
                aria-pressed={capacity === value}
                onClick={() => setCapacity(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <p>{capacityOptions[capacity].note}</p>
      </div>
      <div className="kpi-grid">
        {stats.map((stat) => (
          <div
            className={`kpi-card ${stat.alert ? "alert" : ""}`}
            key={stat.label}
          >
            <span className="eyebrow">{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.sub}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel title="SALES & HOURLY DEMAND" className="chart-panel">
          <div className="chart-legend">
            <span>
              <i className="legend-volt" /> TODAY
            </span>
            <span>
              <i className="legend-muted" /> TYPICAL
            </span>
          </div>
          <div className="bar-chart">
            {[23, 31, 43, 61, 72, 84, 96, 86, 76, 64, 49, 28].map(
              (n, index) => (
                <div className="bar-pair" key={index}>
                  <span style={{ height: `${Math.max(10, n - 12)}%` }} />
                  <span
                    className={index === 6 ? "current" : ""}
                    style={{ height: `${n}%` }}
                  />
                </div>
              ),
            )}
          </div>
          <div className="chart-axis">
            <span>9A</span>
            <span>12P</span>
            <span>3P</span>
            <span>6P</span>
            <span>9P</span>
          </div>
        </Panel>
        <Panel title="OPERATIONAL ALERTS" className="alerts-panel">
          <div className="alert-row danger">
            <AlertTriangle size={19} />
            <div>
              <strong>{late.length} orders near SLA</strong>
              <p>Review the live queue.</p>
            </div>
            <Link href="/operator/orders">VIEW</Link>
          </div>
          <div className="alert-row warning">
            <Package size={19} />
            <div>
              <strong>Garlic Parmesan low</strong>
              <p>
                {soldIds.includes("gp")
                  ? "Item is currently sold out."
                  : "Consider marking it sold out."}
              </p>
            </div>
            <Link href="/operator/menu">MENU</Link>
          </div>
          <div className="alert-row">
            <Activity size={19} />
            <div>
              <strong>Demand +27%</strong>
              <p>Versus a typical shift.</p>
            </div>
          </div>
          <div className="alert-row warning">
            <PlugZap size={19} />
            <div>
              <strong>Uber Eats setup required</strong>
              <p>No live connection.</p>
            </div>
            <Link href="/operator/integrations">VIEW</Link>
          </div>
        </Panel>
        <Panel title="BEST SELLERS">
          <div className="ranked-list">
            {items.slice(0, 4).map((item, index) => (
              <div key={item.id}>
                <span>0{index + 1}</span>
                <strong>{item.name}</strong>
                <span>{[38, 34, 29, 22][index]} SOLD</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="DELIVERY PERFORMANCE">
          <div className="mini-stats">
            <div>
              <strong>31m</strong>
              <span>AVG DELIVERY</span>
            </div>
            <div>
              <strong>94%</strong>
              <span>ON TIME</span>
            </div>
            <div>
              <strong>4</strong>
              <span>ACTIVE DRIVERS</span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { advanceOrder, setOrderStatus, notify } = useStore();
  const [open, setOpen] = useState(false);
  const left = order.promised - order.age;
  const late = left <= 3 && order.status !== "OUT_FOR_DELIVERY";
  return (
    <article className={`order-card ${late ? "late" : ""}`}>
      <div className="order-card-top">
        <strong>#{order.id}</strong>
        <span className={late ? "danger-text" : ""}>
          {late ? `${left}m LEFT` : `due ${left}m`}
        </span>
      </div>
      <div className="order-meta">
        {order.customer} · {order.age}m ago
      </div>
      <div className="order-meta">
        {order.items} items · {money(order.total)}
      </div>
      <div className="channel">
        <i style={{ background: channelColors[order.channel] }} />{" "}
        {order.channel}
      </div>
      {order.note ? <div className="order-note">{order.note}</div> : null}
      <div className="order-actions">
        <button
          className="button primary"
          onClick={() => advanceOrder(order.id)}
        >
          {actions[order.status]}
        </button>
        {order.status === "NEW" ? (
          <button
            className="button outline danger-outline"
            onClick={() => {
              const reason = window.prompt("Reason for rejection?");
              if (reason) {
                setOrderStatus(order.id, "REJECTED");
                notify(`Order #${order.id} rejected: ${reason}`);
              }
            }}
          >
            Reject
          </button>
        ) : null}
        <button
          className="more-button"
          aria-label={`More actions for order ${order.id}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ⋯
        </button>
      </div>
      {open ? (
        <div className="order-menu">
          {[
            "Delay",
            "Contact customer",
            "Cancel",
            "Refund",
            "Print",
            "View details",
          ].map((action) => (
            <button
              key={action}
              onClick={() => {
                setOpen(false);
                if (action === "Cancel") {
                  if (window.confirm(`Cancel order #${order.id}?`))
                    setOrderStatus(order.id, "CANCELLED");
                } else if (action === "Print") window.print();
                else
                  notify(
                    `${action} requires a connected service in this demo.`,
                  );
              }}
            >
              {action}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
function LiveOrders() {
  const { orders } = useStore();
  return (
    <>
      <AdminHeader
        title="LIVE ORDERS"
        detail="Every channel. One kitchen queue."
      />
      <div className="kanban">
        {statuses.map((status) => (
          <section className="kanban-column" key={status}>
            <div className="kanban-heading">
              <h2>{statusLabels[status]}</h2>
              <span>{orders.filter((o) => inColumn(o, status)).length}</span>
            </div>
            <div>
              {orders
                .filter((o) => inColumn(o, status))
                .map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function KitchenDisplay() {
  const { orders, advanceOrder, notify } = useStore();
  const [station, setStation] = useState("FRY");
  const [done, setDone] = useState<string[]>([]);
  const queue = orders.filter((o) =>
    ["NEW", "CONFIRMED", "PREPARING", "READY"].includes(o.status),
  );
  return (
    <div className="kds">
      <div className="kds-header">
        <div className="kds-stations">
          {["FRY", "SAUCE", "ASSEMBLY", "PACKAGING"].map((value) => (
            <button
              key={value}
              className={station === value ? "selected" : ""}
              onClick={() => setStation(value)}
            >
              {value} <span>{queue.length}</span>
            </button>
          ))}
        </div>
        <strong>
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </strong>
      </div>
      <div className="kds-grid">
        {queue.map((order) => {
          const left = order.promised - order.age;
          return (
            <article key={order.id} className="kds-ticket">
              <div
                className={`kds-ticket-top ${left <= 3 ? "late" : left <= 8 ? "warning" : ""}`}
              >
                <strong>#{order.id}</strong>
                <span>{order.age}:00</span>
              </div>
              <div className="kds-ticket-body">
                <p>
                  {order.channel.toUpperCase()} · DUE IN {left}M
                </p>
                <h2>{order.items} × WING THEORY ORDER</h2>
                <strong className="volt-text">
                  {order.note || "ORIGINAL SAUCE MIX"}
                </strong>
                <div className="modifier-row">
                  {order.note.includes("EXTRA CRISPY") ? (
                    <span>EXTRA CRISPY</span>
                  ) : null}
                  {order.note.includes("ALLERGY") ? (
                    <span className="allergy">⚠ ALLERGY</span>
                  ) : null}
                  {order.note.includes("NO RANCH") ? (
                    <span className="outlined">NO RANCH</span>
                  ) : null}
                </div>
                <button
                  className="button primary bump"
                  onClick={() => {
                    setDone((current) => [...current, order.id]);
                    advanceOrder(order.id);
                    notify(`Order #${order.id} bumped at ${station}.`);
                  }}
                >
                  BUMP ✓
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {done.length ? (
        <button
          className="text-button"
          onClick={() => {
            notify(`Last bumped order: #${done[done.length - 1]}`);
            setDone((current) => current.slice(0, -1));
          }}
        >
          Recall last ticket
        </button>
      ) : null}
    </div>
  );
}

function MenuManagement() {
  const { soldIds, toggleSold } = useStore();
  const [selected, setSelected] = useState(items[0]);
  const [tab, setTab] = useState("All items");
  return (
    <>
      <AdminHeader
        title="MENU MANAGEMENT"
        detail="Item availability updates this local demo instantly."
      />
      <div className="management-layout">
        <section className="admin-panel">
          <div className="admin-tabs">
            {[
              "All items",
              "Categories",
              "Modifier groups",
              "Sauces",
              "Scheduled & limited",
            ].map((value) => (
              <button
                key={value}
                className={tab === value ? "selected" : ""}
                onClick={() => setTab(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="management-table">
            <div className="table-head">
              <span>ITEM</span>
              <span>STATUS</span>
              <span>CATEGORY</span>
              <span>PRICE</span>
              <span>HEAT</span>
              <span>CHANNELS</span>
              <span>ACTION</span>
            </div>
            {items.map((item) => (
              <div
                className={`table-row ${selected.id === item.id ? "selected" : ""}`}
                key={item.id}
                onClick={() => setSelected(item)}
              >
                <strong>{item.name}</strong>
                <StatusBadge
                  text={soldIds.includes(item.id) ? "SOLD OUT" : "ACTIVE"}
                  color={soldIds.includes(item.id) ? "magenta" : "volt"}
                />
                <span>{item.category}</span>
                <span>{money(item.price)}</span>
                <span style={{ color: heatColors[item.heat] }}>
                  ● {item.heat}
                </span>
                <small>
                  {soldIds.includes(item.id) ? "Hidden locally" : "Direct demo"}
                </small>
                <button
                  className={`small-action ${soldIds.includes(item.id) ? "" : "danger"}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSold(item.id);
                  }}
                >
                  {soldIds.includes(item.id) ? "Restore" : "86 item"}
                </button>
              </div>
            ))}
          </div>
        </section>
        <aside className="admin-panel editor-panel">
          <p className="eyebrow">ITEM EDITOR</p>
          <h2>{selected.name}</h2>
          <div className="photo-slot">
            <Image
              src={itemImages[selected.id]}
              alt={selected.name}
              fill
              sizes="320px"
              className="food-photo"
            />
          </div>
          <label>
            NAME
            <input value={selected.name} readOnly />
          </label>
          <label>
            DESCRIPTION
            <textarea value={selected.description} readOnly />
          </label>
          <div className="price-matrix">
            <h3>SIZE / PRICE</h3>
            {[6, 10, 15, 20, 30, 50].map((count) => (
              <div key={count}>
                <span>{count} pieces</span>
                <span>{money(priceForItem(selected, count))}</span>
              </div>
            ))}
          </div>
          <p className="help-text">
            Demo editor is read only. Item availability updates the direct menu.
            Marketplace sync requires provider connections.
          </p>
        </aside>
      </div>
    </>
  );
}

function AnalyticsPage() {
  const metrics = [
    { label: "GROSS SALES", value: "$4,286" },
    { label: "NET SALES", value: "$3,812" },
    { label: "ORDERS", value: "127" },
    { label: "AVG ORDER VALUE", value: "$33.75" },
    { label: "PREP / DELIVERY", value: "18m / 31m" },
    { label: "REFUNDS / DISCOUNTS", value: "$86 / $214" },
    { label: "REPEAT RATE", value: "42%" },
    { label: "CLUB MEMBERS", value: "3,842" },
  ];
  return (
    <>
      <AdminHeader
        title="ANALYTICS"
        detail="Performance across every order channel."
      />
      <div className="kpi-grid">
        {metrics.map((x) => (
          <div className="kpi-card" key={x.label}>
            <span className="eyebrow">{x.label}</span>
            <strong>{x.value}</strong>
          </div>
        ))}
      </div>
      <div className="dashboard-grid analytics-grid">
        <Panel title="REVENUE BY HOUR" className="chart-panel">
          <div className="bar-chart">
            {[30, 37, 46, 59, 77, 97, 88, 82, 69, 57, 44, 30].map(
              (n, index) => (
                <div className="bar-pair" key={index}>
                  <span
                    style={{ height: `${n}%`, background: "var(--volt)" }}
                  />
                </div>
              ),
            )}
          </div>
          <div className="chart-axis">
            <span>9A</span>
            <span>12P</span>
            <span>3P</span>
            <span>6P</span>
            <span>9P</span>
          </div>
        </Panel>
        <Panel title="TOP FLAVORS">
          <div className="flavor-bars">
            {items.slice(0, 5).map((x, index) => (
              <div key={x.id}>
                <span>{x.name}</span>
                <i>
                  <b
                    style={{
                      width: `${90 - index * 13}%`,
                      background:
                        index === 0 ? "var(--volt)" : "var(--bar-muted)",
                    }}
                  />
                </i>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="REVENUE BY CHANNEL">
          <div className="channel-bars">
            {Object.entries(channelColors).map(([name, color], index) => (
              <div key={name}>
                <span>{name}</span>
                <i>
                  <b
                    style={{
                      width: `${[58, 24, 14, 9][index]}%`,
                      background: color,
                    }}
                  />
                </i>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="LOYALTY PARTICIPATION">
          <div className="mini-stats">
            <div>
              <strong>42%</strong>
              <span>REPEAT RATE</span>
            </div>
            <div>
              <strong>3,842</strong>
              <span>CLUB MEMBERS</span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function IntegrationsPage() {
  const [showSetup, setShowSetup] = useState(false);
  return (
    <>
      <AdminHeader
        title="INTEGRATIONS"
        detail="Provider connection states for this demo."
      />
      <div className="integration-health">
        <div>
          <strong>0</strong>
          <span>LIVE MARKETPLACE CONNECTIONS</span>
        </div>
        <div>
          <strong>0</strong>
          <span>OPEN OUTAGES</span>
        </div>
        <div>
          <strong>0</strong>
          <span>OPEN SYNC ERRORS</span>
        </div>
        <div>
          <strong>—</strong>
          <span>COMMISSIONS</span>
        </div>
      </div>
      <div className="dashboard-grid">
        <Panel title="DELIVERY PROVIDERS">
          <div className="provider-list">
            {[
              {
                name: providerNames.direct,
                status: "DEMO",
                color: "volt",
                description: "Local ordering flow only",
              },
              {
                name: providerNames.doordash,
                status: "NOT CONNECTED",
                color: "muted",
                description: "Adapter connection required",
              },
              {
                name: providerNames.ubereats,
                status: "NOT CONNECTED",
                color: "muted",
                description: "No live credentials configured",
              },
              {
                name: providerNames.grubhub,
                status: "NOT CONNECTED",
                color: "muted",
                description: "Adapter connection required",
              },
            ].map((provider) => (
              <div className="provider" key={provider.name}>
                <div>
                  <strong>{provider.name}</strong>
                  <p>{provider.description}</p>
                </div>
                <StatusBadge text={provider.status} color={provider.color} />
              </div>
            ))}
          </div>
          <button className="button outline" onClick={() => setShowSetup(true)}>
            + ADD PROVIDER
          </button>
          {showSetup ? (
            <p className="help-text" role="status">
              Provider credentials and a verified adapter are needed before a
              connection can be added.
            </p>
          ) : null}
        </Panel>
        <Panel title="POS INTEGRATIONS">
          <div className="pos-grid">
            {posProviders.map((name) => (
              <div key={name}>
                <strong>{name}</strong>
                <StatusBadge text="PLANNED" color="muted" />
              </div>
            ))}
          </div>
          <p className="help-text">
            POS connections are planned and have no live business logic in this
            demo.
          </p>
        </Panel>
      </div>
    </>
  );
}

function OtherAdmin({ name }: { name: string }) {
  const title = name.replaceAll("-", " ").toUpperCase();
  const { orders, resetDemo } = useStore();
  return (
    <>
      <AdminHeader
        title={title}
        detail="A focused view of the current demo data."
      />
      <div className="dashboard-grid">
        <Panel title={`${title} OVERVIEW`}>
          <p className="muted">
            This area is prepared for live data and operations. Connect the
            required services before using it in production.
          </p>
          <div className="mini-stats">
            <div>
              <strong>{orders.length}</strong>
              <span>DEMO ORDERS</span>
            </div>
            <div>
              <strong>1</strong>
              <span>KITCHEN</span>
            </div>
          </div>
          {name === "settings" ? (
            <button className="button outline" onClick={resetDemo}>
              RESET DEMO DATA
            </button>
          ) : null}
        </Panel>
        <Panel title="QUICK LINKS">
          <div className="admin-links">
            <Link href="/operator/orders">
              LIVE ORDERS <ArrowRight size={18} />
            </Link>
            <Link href="/operator/menu">
              MENU MANAGEMENT <ArrowRight size={18} />
            </Link>
            <Link href="/operator/integrations">
              INTEGRATIONS <ArrowRight size={18} />
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}

export function AdminPage({ path }: { path: string }) {
  const current = path.split("/")[2] || "";
  const { orders } = useStore();
  const active = orders.filter((x) =>
    ["NEW", "CONFIRMED"].includes(x.status),
  ).length;
  return (
    <div className={`admin-shell ${current === "kitchen" ? "kds-shell" : ""}`}>
      <aside className="admin-sidebar">
        <Link href="/" className="wordmark">
          <BrandLogo />
        </Link>
        <p className="sidebar-label">OPERATOR PLATFORM</p>
        <nav aria-label="Operator navigation">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              className={path === href ? "active" : ""}
              href={href}
            >
              <Icon size={17} />
              {label}
              {label === "Orders" ? <small>{active}</small> : null}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="live-dot" /> LOCAL DEMO{" "}
          <Link href="/">
            CUSTOMER SITE <ArrowRight size={13} />
          </Link>
        </div>
      </aside>
      <main id="main" className="admin-main">
        {!current ? (
          <CommandCenter />
        ) : current === "orders" ? (
          <LiveOrders />
        ) : current === "kitchen" ? (
          <KitchenDisplay />
        ) : current === "menu" ? (
          <MenuManagement />
        ) : current === "analytics" ? (
          <AnalyticsPage />
        ) : current === "integrations" ? (
          <IntegrationsPage />
        ) : (
          <OtherAdmin name={current} />
        )}
      </main>
    </div>
  );
}
