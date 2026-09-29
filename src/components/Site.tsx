"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  Home,
  Menu as MenuIcon,
  ShoppingBag,
  Gift,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { capacityOptions } from "@/lib/data";
import { CustomerPage } from "./customer";
import { BrandLogo } from "./BrandLogo";
const AdminPage = dynamic(() =>
  import("./admin").then((module) => module.AdminPage),
);

const customerNav = [
  { label: "MENU", href: "/menu" },
  { label: "FLAVORS", href: "/flavors" },
  { label: "DROPS", href: "/drops" },
  { label: "THEORY CLUB", href: "/rewards" },
  { label: "CATERING", href: "/catering" },
];
const mobileNav = [
  { label: "HOME", href: "/", icon: Home },
  { label: "MENU", href: "/menu", icon: MenuIcon },
  { label: "ORDER", href: "/cart", icon: ShoppingBag },
  { label: "REWARDS", href: "/rewards", icon: Gift },
  { label: "ACCOUNT", href: "/account", icon: UserRound },
];

export default function Site({ path }: { path: string }) {
  const pathname = usePathname() || path;
  const { cart, capacity, toast } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (pathname.startsWith("/operator"))
    return (
      <>
        <AdminPage path={pathname} />
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      </>
    );
  return (
    <div className="site-shell">
      <div className="preview-banner" role="note">
        PREVIEW SITE · Orders are a demo. No payment or delivery is processed.
      </div>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Wing Theory home">
          <BrandLogo />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {customerNav.map((link) => (
            <Link
              key={link.href}
              className={pathname === link.href ? "active" : ""}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/account" className="sign-in">
            Sign in
          </Link>
          <Link href="/cart" className="button primary cart-button">
            CART · {cartCount}
          </Link>
        </div>
      </header>
      <main id="main">
        <CustomerPage path={pathname} />
      </main>
      <footer className="site-footer">
        <div>
          <Link href="/" className="wordmark">
            <BrandLogo />
          </Link>
          <p>Crispy wings. Original sauces. Zero boring bites.</p>
        </div>
        <div>
          <h3>EXPLORE</h3>
          <Link href="/menu">Menu</Link>
          <Link href="/flavors">Flavor Theory</Link>
          <Link href="/catering">Catering</Link>
          <Link href="/rewards">Theory Club</Link>
        </div>
        <div>
          <h3>HELP</h3>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/allergens">Allergens</Link>
          <Link href="/accessibility">Accessibility</Link>
        </div>
        <div>
          <h3>THE FINE PRINT</h3>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/about">Our theory</Link>
          <Link href="/operator">
            Operator demo <ArrowRight size={13} />
          </Link>
        </div>
        <div className="footer-base">
          © {new Date().getFullYear()} WING THEORY. DELIVERY ONLY.{" "}
          <span>
            KITCHEN · {capacity} · {capacityOptions[capacity].eta}
          </span>
        </div>
      </footer>
      <nav className="mobile-tabs" aria-label="Mobile navigation">
        {mobileNav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "active"
                : ""
            }
          >
            <Icon size={21} strokeWidth={2} />
            <span>{label}</span>
            {href === "/cart" && cartCount > 0 ? <i>{cartCount}</i> : null}
          </Link>
        ))}
      </nav>
      <div
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </div>
  );
}
