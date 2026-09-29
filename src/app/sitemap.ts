import type { MetadataRoute } from "next";
import { itemPath, items } from "@/lib/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = [
    "/",
    "/menu",
    "/flavors",
    "/drops",
    "/rewards",
    "/catering",
    "/about",
    "/faq",
    "/contact",
    "/allergens",
    "/accessibility",
    "/privacy",
    "/terms",
    ...items.map(itemPath),
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "/" || path === "/menu" ? "weekly" : "monthly",
  }));
}
