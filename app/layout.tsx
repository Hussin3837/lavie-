import "./globals.css";

import type { Metadata } from "next";

import { CartProvider } from "../components/CartContext";
import MusicPlayer from "../components/MusicPlayer";

export const metadata: Metadata = {
  title: "LA VIE — Luxury Perfume House",
  description: "Discover cinematic luxury fragrances crafted for unforgettable presence.",
  keywords: [
    "Luxury Perfume",
    "Perfume House",
    "Designer Fragrance",
    "LA VIE",
    "Luxury Brand",
  ],
  authors: [{ name: "LA VIE" }],
  themeColor: "#050505",
  openGraph: {
    title: "LA VIE — Luxury Perfume House",
    description: "Discover cinematic luxury fragrances crafted for unforgettable presence.",
    url: "https://lavie.com",
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
         <body>
  {children}

  <footer style={{
    background: "#050505",
    color: "#d7b27a",
    textAlign: "center",
    padding: "30px 20px",
    borderTop: "1px solid rgba(215,178,122,.25)"
  }}>
    <p style={{ marginBottom: "12px" }}>
      © 2026 La Vie Parfum
    </p>

    <nav style={{ display: "flex", justifyContent: "center", gap: "18px", flexWrap: "wrap" }}>
      <a href="/" style={{ color: "#d7b27a", textDecoration: "none" }}>Home</a>
      <a href="/versand" style={{ color: "#d7b27a", textDecoration: "none" }}>Versand</a>
<a href="/kontakt" style={{ color: "#d7b27a", textDecoration: "none" }}>Kontakt</a>
      <a href="/impressum" style={{ color: "#d7b27a", textDecoration: "none" }}>Impressum</a>
      <a href="/datenschutz" style={{ color: "#d7b27a", textDecoration: "none" }}>Datenschutz</a>
      <a href="/agb" style={{ color: "#d7b27a", textDecoration: "none" }}>AGB</a>
      <a href="/widerruf" style={{ color: "#d7b27a", textDecoration: "none" }}>Widerruf</a>
    </nav>
  </footer>
</body>
          <MusicPlayer />
        </CartProvider>

        <div id="cursor-glow" className="cursor-glow" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const glow = document.getElementById('cursor-glow');
              if (glow) {
                window.addEventListener('mousemove', (e) => {
                  glow.style.left = e.clientX + 'px';
                  glow.style.top = e.clientY + 'px';
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
