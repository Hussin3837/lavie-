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
                  <a href="mailto:info@lavieparfum.de">info@lavieparfum.de</a>
                </div>
                <div className="lavie-footer-column">
                  <h3>Customer care</h3>
                  <a href="/versand">Versand</a>
                  <a href="/widerruf">Widerruf</a>
                  <a href="/agb">AGB</a>
                  <a href="/datenschutz">Datenschutz</a>
                  <a href="/impressum">Impressum</a>
                  <a href="mailto:orders@lavieparfum.de">orders@lavieparfum.de</a>
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
                    <span className="lavie-logo-chip lavie-logo-chip--applepay"><strong className="pay-word pay-apple"><svg aria-hidden="true" viewBox="0 0 24 24" width="34" height="34" style={{display:"inline-block",verticalAlign:"middle",marginRight:3}} fill="currentColor"><path d="M17.05 12.54c.03 2.8 2.45 3.73 2.48 3.75-.02.06-.39 1.35-1.28 2.68-.77 1.15-1.57 2.3-2.83 2.32-1.24.02-1.64-.75-3.06-.75-1.42 0-1.87.73-3.04.77-1.22.04-2.15-1.24-2.93-2.39-1.59-2.31-2.8-6.52-1.17-9.36a4.54 4.54 0 0 1 3.81-2.32c1.19-.02 2.31.82 3.04.82.73 0 2.1-1.01 3.54-.86.6.03 2.3.24 3.39 1.84-.09.06-2.02 1.18-1.95 3.5ZM14.9 5.68c.64-.78 1.07-1.86.95-2.94-.92.04-2.04.61-2.7 1.39-.6.69-1.13 1.79-.99 2.84 1.03.08 2.08-.53 2.74-1.29Z"/></svg> Pay</strong></span>
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
