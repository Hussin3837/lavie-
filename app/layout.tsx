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
                    <span className="lavie-logo-chip lavie-logo-chip--visa"><strong className="pay-word pay-visa">VISA</strong></span>
                    <span className="lavie-logo-chip lavie-logo-chip--mastercard"><svg width="65" height="39" viewBox="0 0 65 39" role="img" aria-label="Mastercard"><circle cx="23" cy="19.5" r="17" fill="#EB001B"/><circle cx="42" cy="19.5" r="17" fill="#F79E1B"/><path d="M32.5 6.8a17 17 0 0 1 0 25.4 17 17 0 0 1 0-25.4Z" fill="#FF5F00"/></svg></span>
                    <span className="lavie-logo-chip lavie-logo-chip--paypal"><strong className="pay-word pay-paypal">PayPal</strong></span>
                    <span className="lavie-logo-chip lavie-logo-chip--klarna"><strong className="pay-word pay-klarna">Klarna.</strong></span>
                    <span className="lavie-logo-chip lavie-logo-chip--applepay"><strong className="pay-word pay-apple"><span aria-hidden="true"></span> Pay</strong></span>
                    <span className="lavie-logo-chip lavie-logo-chip--googlepay"><strong className="pay-word pay-google"><span className="google-g" aria-hidden="true">G</span> Pay</strong></span>
                  </div>
                </div>
                <div className="lavie-footer-service">
                  <h3>Delivery partners</h3>
                  <div className="lavie-logo-row" aria-label="Shipping carriers">
                    <span className="lavie-logo-chip lavie-logo-chip--dhl" aria-label="DHL"><strong>DHL</strong></span>
                    <span className="lavie-logo-chip lavie-logo-chip--hermes"><strong className="pay-word pay-hermes">HERMES</strong></span>
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
