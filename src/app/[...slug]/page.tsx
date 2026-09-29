import Site from "@/components/Site";
import type { Metadata } from "next";
import { itemPath, items, slug } from "@/lib/data";

const publicPages = [
  "menu",
  "flavors",
  "drops",
  "rewards",
  "catering",
  "about",
  "faq",
  "contact",
  "careers",
  "blog",
  "allergens",
  "accessibility",
  "privacy",
  "terms",
  "gift-cards",
];
export function generateStaticParams() {
  return [
    ...publicPages.map((page) => ({ slug: [page] })),
    ...items.map((item) => ({
      slug: itemPath(item).split("/").filter(Boolean),
    })),
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: parts } = await params;
  const item = items.find((value) => itemPath(value) === `/${parts.join("/")}`);
  if (item)
    return { title: `${item.name} | Menu`, description: item.description };
  if (
    parts[0] === "operator" ||
    parts[0] === "account" ||
    parts[0] === "cart" ||
    parts[0] === "checkout" ||
    parts[0] === "order"
  )
    return {
      robots: { index: false, follow: false },
      title: (parts[1] || parts[0]).replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      ),
    };
  const name = parts.map((value) => value.replaceAll("-", " ")).join(" | ");
  return {
    title: name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    description:
      parts[0] === "menu"
        ? "Explore original sauces, crispy wings, tenders, sandwiches, sides and more from Wing Theory."
        : `Explore ${name} at Wing Theory, a delivery-only wing brand.`,
  };
}
export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <Site path={`/${slug.join("/")}`} />;
}
