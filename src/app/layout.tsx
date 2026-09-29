import type { Metadata } from "next";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wing Theory | Wings, Engineered to Obsession",
    template: "%s | Wing Theory",
  },
  description:
    "Crispy wings. Original sauces. Zero boring bites. Explore the Wing Theory menu and order delivery.",
  icons: {
    icon: [{ url: "/brand/wing-theory-mark.svg", type: "image/svg+xml" }],
  },
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
