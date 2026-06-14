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
          {children}
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
