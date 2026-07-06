import "./globals.css";

import type { Metadata, Viewport } from "next";

import { CartProvider } from "../components/CartContext";
import MusicPlayer from "../components/MusicPlayer";

export const metadata: Metadata = {
  title: "LA VIE — Luxury Perfume House",
  description:
    "Discover cinematic luxury fragrances crafted for unforgettable presence.",
  keywords: [
    "Luxury Perfume",
    "Perfume House",
    "Designer Fragrance",
    "LA VIE",
    "Luxury Brand",
  ],
  authors: [{ name: "LA VIE" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "LA VIE — Luxury Perfume House",
    description:
      "Discover cinematic luxury fragrances crafted for unforgettable presence.",
    url: "https://lavieparfum.de",
    siteName: "LA VIE",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "LA VIE",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
          {children}

          <footer className="lavie-footer">
            <div className="lavie-footer-inner">
              <h2>LA VIE</h2>
              <p>Crafting Your Aromatic Story</p>

              <nav>
                <a href="/">Home</a>
                <a href="/#collection">Collection</a>
                <a href="/versand">Versand</a>
                <a href="/kontakt">Kontakt</a>
                <a href="/impressum">Impressum</a>
                <a href="/datenschutz">Datenschutz</a>
                <a href="/agb">AGB</a>
                <a href="/widerruf">Widerruf</a>
              </nav>

              <span>© 2026 La Vie Parfum. Alle Rechte vorbehalten.</span>
            </div>
          </footer>

          <MusicPlayer />
        </CartProvider>

            </body>
    </html>
  );
}