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

          <footer className="lavie-footer" id="contact">
            <div className="lavie-footer-inner">
              <div className="lavie-footer-top">
                <div className="lavie-footer-brand">
                  <h2>LA VIE</h2>
                  <p>Crafting Your Aromatic Story</p>
                  <p className="lavie-footer-description">Fine fragrance. A personal signature.</p>
                </div>
                <div className="lavie-footer-column">
                  <h3>Explore</h3>
                  <a href="/">Home</a>
                  <a href="/#collection">Collection</a>
                  <a href="/#journeys">Experiences</a>
                  <a href="/kontakt">Kontakt</a>
                </div>
                <div className="lavie-footer-column">
                  <h3>Customer care</h3>
                  <a href="/versand">Versand</a>
                  <a href="/widerruf">Widerruf</a>
                  <a href="/agb">AGB</a>
                  <a href="/datenschutz">Datenschutz</a>
                  <a href="/impressum">Impressum</a>
                </div>
              </div>
              <div className="lavie-footer-services">
                <div className="lavie-footer-service">
                  <h3>Secure payment</h3>
                  <div className="lavie-logo-row" aria-label="Payment methods">
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/visa.svg" alt="Visa" /></span>
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/mastercard.svg" alt="Mastercard" /></span>
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/paypal.svg" alt="PayPal" /></span>
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/klarna.svg" alt="Klarna" /></span>
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/applepay.svg" alt="Apple Pay" /></span>
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/googlepay.svg" alt="Google Pay" /></span>
                  </div>
                </div>
                <div className="lavie-footer-service">
                  <h3>Delivery partners</h3>
                  <div className="lavie-logo-row" aria-label="Shipping carriers">
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/dhl.svg" alt="DHL" /></span>
                    <span className="lavie-logo-chip"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/hermes.svg" alt="Hermes" /></span>
                  </div>
                </div>
              </div>
              <div className="lavie-footer-bottom"><span>© {new Date().getFullYear()} La Vie Parfum. Alle Rechte vorbehalten.</span><span>Made with care in Germany</span></div>
            </div>
          </footer>

          <MusicPlayer />
        </CartProvider>

            </body>
    </html>
  );
}
