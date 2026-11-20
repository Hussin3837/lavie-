"use client";

import CinematicEffects from "../components/CinematicEffects";
import Link from "next/link";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { useCart } from "../components/CartContext";
import CartDrawer from "../components/CartDrawer";
import { products as fallbackProducts } from "../lib/products";
import { supabase } from "../lib/supabase";

type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  image: string;
  image2?: string | null;
  image3?: string | null;
  stock?: number | null;
  active?: boolean | null;
};

const initialProducts: StoreProduct[] = fallbackProducts.map((product: any) => ({
  ...product,
  id: String(product.id),
  slug: product.slug || String(product.id),
  price: Number(product.price ?? 0),
  description: product.description ?? "",
  image: product.image || product.image_url || "",
}));

const quickAnswers: Record<string, string> = {
  shipping: "Free shipping is available in Germany.",
  payment:
    "LA VIE supports Visa, Mastercard, Apple Pay, Google Pay, Klarna and PayPal.",
  perfume:
    "All LA VIE fragrances are Eau de Parfum 50ml with long lasting performance.",
  contact: "You can contact LA VIE at hussine@gmail.com",
};

function getAiReply(message: string) {
  const text = message.toLowerCase();

  if (
    text.includes("ship") ||
    text.includes("delivery") ||
    text.includes("توصيل")
  ) {
    return quickAnswers.shipping;
  }

  if (
    text.includes("pay") ||
    text.includes("visa") ||
    text.includes("paypal") ||
    text.includes("klarna")
  ) {
    return quickAnswers.payment;
  }

  if (
    text.includes("perfume") ||
    text.includes("scent") ||
    text.includes("عطر")
  ) {
    return quickAnswers.perfume;
  }

  if (text.includes("contact") || text.includes("email")) {
    return quickAnswers.contact;
  }

  return "Welcome to LA VIE ✨ I can help you choose the perfect fragrance.";
}

type ThemeMode = "light" | "dark";
type Language = "en" | "de";

type HeroSlide = {
  type: "image" | "video";
  src: string;
  eyebrow: { en: string; de: string };
  title: { en: string; de: string };
  button: { en: string; de: string };
};

const heroSlides: HeroSlide[] = [
  {
    type: "video",
    src: "/hero/slide-6.mp4",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
];

const translations = {
  en: {
    home: "Home",
    collection: "Collection",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    shopCollection: "Shop Collection",
    freeShipping: "Free Shipping in Germany",
    premiumIngredients: "Premium Ingredients",
    longLasting: "Long Lasting Scent",
    secureCheckout: "Secure European Checkout",
    shopAll: "Shop All Perfumes",
    exploreCollection: "Explore the collection →",
    yourFormula: "YOUR FORMULA",
    createPerfume: "Create Your Perfume",
    formulaLine: "Oil + alcohol + bottle →",
    findVibe: "FIND YOUR VIBE",
    shopMood: "Shop by Mood",
    discoverScent: "Discover your scent →",
    mostLoved: "MOST LOVED",
    bestSellers: "Best Sellers",
    discoverFavorites: "Discover favorites →",
    exploreLavie: "Explore LA VIE",
    shopByCollection: "Shop by Collection",
    viewAll: "View all fragrances →",
    signature: "Signature",
    oriental: "Oriental",
    floral: "Floral",
    fresh: "Fresh",
    woody: "Woody",
    new: "New",
    atelier: "The LA VIE Atelier",
    createOwn: "Create Your Own Perfume",
    createText:
      "Build your fragrance ritual your way. Choose a perfume oil, pair it with perfumer's alcohol, select your bottle, and create a scent experience that belongs to you.",
    step1: "Choose your perfume oil",
    step2: "Select alcohol & concentration",
    step3: "Choose your bottle",
    startCreating: "Start Creating",
    yourPerfume: "YOUR PERFUME",
    oil: "OIL",
    alcohol: "ALCOHOL",
    madeByYou: "Made by you. Finished by LA VIE.",
    ourCollection: "Our Collection",
    signatureScent: "Discover Your Signature Scent",
    addCart: "Add to Cart",
    buyNow: "Buy Now",
  },
  de: {
    home: "Start",
    collection: "Kollektion",
    about: "Über uns",
    contact: "Kontakt",
    cart: "Warenkorb",
    shopCollection: "Kollektion entdecken",
    freeShipping: "Kostenloser Versand in Deutschland",
    premiumIngredients: "Hochwertige Inhaltsstoffe",
    longLasting: "Lang anhaltender Duft",
    secureCheckout: "Sicherer europäischer Checkout",
    shopAll: "Alle Parfums",
    exploreCollection: "Kollektion entdecken →",
    yourFormula: "DEINE FORMEL",
    createPerfume: "Kreiere dein Parfum",
    formulaLine: "Öl + Alkohol + Flakon →",
    findVibe: "FINDE DEINEN STIL",
    shopMood: "Nach Stimmung wählen",
    discoverScent: "Deinen Duft entdecken →",
    mostLoved: "AM BELIEBTESTEN",
    bestSellers: "Bestseller",
    discoverFavorites: "Favoriten entdecken →",
    exploreLavie: "LA VIE entdecken",
    shopByCollection: "Nach Kollektion shoppen",
    viewAll: "Alle Düfte ansehen →",
    signature: "Signature",
    oriental: "Orientalisch",
    floral: "Blumig",
    fresh: "Frisch",
    woody: "Holzig",
    new: "Neu",
    atelier: "Das LA VIE Atelier",
    createOwn: "Kreiere dein eigenes Parfum",
    createText:
      "Gestalte dein Duftritual ganz nach deinen Wünschen. Wähle ein Parfumöl, kombiniere es mit Parfümeuralkohol, entscheide dich für einen Flakon und erschaffe deinen persönlichen Duft.",
    step1: "Parfumöl wählen",
    step2: "Alkohol und Konzentration wählen",
    step3: "Flakon wählen",
    startCreating: "Jetzt kreieren",
    yourPerfume: "DEIN PARFUM",
    oil: "ÖL",
    alcohol: "ALKOHOL",
    madeByYou: "Von dir kreiert. Von LA VIE vollendet.",
    ourCollection: "Unsere Kollektion",
    signatureScent: "Entdecke deinen Signaturduft",
    addCart: "In den Warenkorb",
    buyNow: "Jetzt kaufen",
  },
} as const;

export default function HomeClient() {
  const touchStartX = useRef<number | null>(null);
  const heroVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [language, setLanguage] = useState<Language>("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  const [siteProducts, setSiteProducts] =
    useState<StoreProduct[]>(initialProducts);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");

  const [aiMessages, setAiMessages] = useState([
    {
      from: "ai",
      text: "Welcome to LA VIE ✨ I can help you choose the perfect fragrance.",
    },
  ]);

  const {
    addItem,
    count,
    isCartOpen,
    openCart,
    closeCart,
  } = useCart();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(
      "lavie-theme"
    ) as ThemeMode | null;

    const savedLanguage = window.localStorage.getItem(
      "lavie-language"
    ) as Language | null;

    const systemPrefersLight = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;

    setTheme(savedTheme ?? (systemPrefersLight ? "light" : "dark"));
    setLanguage(savedLanguage ?? "en");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("lavie-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("lavie-language", language);
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error(
          "Could not load products from Supabase:",
          error.message
        );
        return;
      }

      const loadedProducts: StoreProduct[] = (data ?? []).map(
        (product: any) => ({
          id: String(product.id),
          name: product.name ?? "Unnamed perfume",
          slug: product.slug || String(product.id),
          price: Number(product.price ?? 0),
          description: product.description ?? "",
          image: product.image_url || product.image || "",
          image2: product.image2 ?? null,
          image3: product.image3 ?? null,
          stock: product.stock ?? null,
          active: product.active ?? true,
        })
      );

      setSiteProducts(loadedProducts);
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const activeSlide = heroSlides[activeHeroSlide];

    heroVideoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeHeroSlide && activeSlide.type === "video") {
        video.muted = true;
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    if (activeSlide.type === "video") {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveHeroSlide(
        (current) => (current + 1) % heroSlides.length
      );
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [activeHeroSlide]);

  function showPreviousHeroSlide() {
    setActiveHeroSlide((current) =>
      current === 0 ? heroSlides.length - 1 : current - 1
    );
  }

  function showNextHeroSlide() {
    setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
  }

  function handleHeroTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleHeroTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;

    const endX =
      event.changedTouches[0]?.clientX ?? touchStartX.current;

    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 45) return;

    if (distance > 0) showPreviousHeroSlide();
    else showNextHeroSlide();
  }

  async function buyNow(product: any) {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert("Checkout failed");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed");
    }
  }

  function sendAiMessage() {
    const trimmed = aiInput.trim();

    if (!trimmed) return;

    const reply = getAiReply(trimmed);

    setAiMessages((current) => [
      ...current,
      {
        from: "user",
        text: trimmed,
      },
      {
        from: "ai",
        text: reply,
      },
    ]);

    setAiInput("");
  }

  return (
    <main className={`lavie-page lavie-home theme-${theme}`}>
      <CinematicEffects />
      <CartDrawer open={isCartOpen} onClose={closeCart} />

      <header className="topbar home-topbar">
        <a href="#home" className="brandmark" aria-label="LA VIE home">
          <img src="/images/logo.png" alt="LA VIE" />
          <span>LA VIE</span>
        </a>

        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((current) => !current)}
          aria-expanded={mobileMenuOpen}
          aria-controls="home-navigation"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="home-navigation"
          className={mobileMenuOpen ? "is-open" : ""}
        >
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>
            {t.home}
          </a>

          <a href="#journeys" onClick={() => setMobileMenuOpen(false)}>
            {language === "de" ? "Erlebnisse" : "Experiences"}
          </a>

          <a href="#collection" onClick={() => setMobileMenuOpen(false)}>
            {t.collection}
          </a>

          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            {t.about}
          </a>

          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
            {t.contact}
          </a>

          <button
            type="button"
            onClick={() => {
              openCart();
              setMobileMenuOpen(false);
            }}
          >
            {t.cart} ({count})
          </button>

          <div className="site-controls" aria-label="Site preferences">
            <button
              type="button"
              className="language-toggle"
              onClick={() =>
                setLanguage((current) =>
                  current === "en" ? "de" : "en"
                )
              }
              aria-label={
                language === "en" ? "Deutsch wählen" : "Switch to English"
              }
            >
              {language === "en" ? "DE" : "EN"}
            </button>

            <button
              type="button"
              className="theme-toggle"
              onClick={() =>
                setTheme((current) =>
                  current === "dark" ? "light" : "dark"
                )
              }
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              <span aria-hidden="true">
                {theme === "dark" ? "☀" : "☾"}
              </span>
            </button>

            <div id="lavie-header-music" className="lavie-header-music" />
          </div>
        </nav>
      </header>

      <section
        id="home"
        className="hero hero-slider home-hero"
        onTouchStart={handleHeroTouchStart}
        onTouchEnd={handleHeroTouchEnd}
      >
        <div className="hero-slides" aria-live="polite">
          {heroSlides.map((slide, index) => (
            <div
              key={`${slide.src}-${index}`}
              className={`hero-slide ${
                index === activeHeroSlide ? "is-active" : ""
              }`}
              aria-hidden={index !== activeHeroSlide}
            >
              {slide.type === "video" ? (
                <video
                  ref={(element) => {
                    heroVideoRefs.current[index] = element;
                  }}
                  muted
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                  className="hero-media"
                  onCanPlay={(event) => {
                    if (index !== activeHeroSlide) return;
                    event.currentTarget.muted = true;
                    event.currentTarget.play().catch(() => {});
                  }}
                  onEnded={(event) => {
                    event.currentTarget.currentTime = 0;
                    event.currentTarget.play().catch(() => {});
                  }}
                >
                  <source src={slide.src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={slide.src}
                  alt=""
                  className="hero-media"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              )}
            </div>
          ))}
        </div>

        <div className="home-hero-shade" />

        <div className="home-hero-content">
          <img
            src="/images/logo-hero-no-tagline.png"
            alt="LA VIE PERFUME"
            className="home-hero-logo"
          />
        </div>
      </section>

      <section className="home-benefits" aria-label="Store benefits">
        <div className="home-container home-benefits-grid">
          <span className="lavie-benefit">
            <span className="lavie-benefit-icon" aria-hidden="true">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 18h29v27H8zM37 27h11l9 10v8H37z" />
                <circle cx="19" cy="46" r="5" />
                <circle cx="48" cy="46" r="5" />
                <path d="M13 12h20M4 27h7M3 34h8" />
                <path d="M43 33h8" />
              </svg>
            </span>
            <span className="lavie-benefit-label">{t.freeShipping}</span>
          </span>

          <span className="lavie-benefit">
            <span className="lavie-benefit-icon" aria-hidden="true">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M32 5 52 17v24L32 55 12 41V17z" />
                <path d="M12 17 32 29l20-12M32 29v26" />
                <path d="m25 14 7-5 7 5" />
                <path d="m25 39 7 4 7-4" />
              </svg>
            </span>
            <span className="lavie-benefit-label">
              {t.premiumIngredients}
            </span>
          </span>

          <span className="lavie-benefit">
            <span className="lavie-benefit-icon" aria-hidden="true">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="32" cy="32" r="23" />
                <circle
                  cx="32"
                  cy="32"
                  r="17"
                  strokeWidth="1"
                  opacity=".45"
                />
                <path d="M32 17v16l12 7" />
                <path d="M32 4v5M32 55v5M4 32h5M55 32h5" />
              </svg>
            </span>
            <span className="lavie-benefit-label">{t.longLasting}</span>
          </span>

          <span className="lavie-benefit">
            <span className="lavie-benefit-icon" aria-hidden="true">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M32 5 53 14v16c0 15-10 24-21 29C21 54 11 45 11 30V14z" />
                <path d="M23 30v-5a9 9 0 0 1 18 0v5" />
                <rect x="20" y="30" width="24" height="18" rx="3" />
                <path d="M32 37v5" />
              </svg>
            </span>
            <span className="lavie-benefit-label">
              {t.secureCheckout}
            </span>
          </span>
        </div>
      </section>

      <section id="journeys" className="home-section home-journeys">
        <div className="home-container">
          <header className="home-section-heading">
            <h2>
              {language === "de"
                ? "Wähle deine Duftreise"
                : "Choose Your Fragrance Journey"}
            </h2>
          </header>

          <div className="home-journey-grid">
            {[
              {
                href: "/create-your-perfume",
                number: "01",
                eyebrow:
                  language === "de"
                    ? "PERSÖNLICHES ATELIER"
                    : "PERSONAL ATELIER",
                title:
                  language === "de"
                    ? "Kreiere dein Parfum"
                    : "Create Your Perfume",
                text:
                  language === "de"
                    ? "Wähle Flakon, Duftöl, Konzentration und dein persönliches Etikett."
                    : "Choose your bottle, fragrance oil, concentration and personalized label.",
                action:
                  language === "de" ? "Jetzt kreieren" : "Start creating",
                comingSoon: false,
              },
              {
                href: "/home-fragrance",
                number: "02",
                eyebrow:
                  language === "de" ? "HOME KOLLEKTION" : "HOME COLLECTION",
                title:
                  language === "de" ? "Raumduft" : "Home Fragrance",
                text:
                  language === "de"
                    ? "Eine exklusive Dufterfahrung für dein Zuhause. Demnächst verfügbar."
                    : "An exclusive fragrance experience for your home. Coming soon.",
                action: "COMING SOON",
                comingSoon: true,
              },
              {
                href: "/car-fragrance",
                number: "03",
                eyebrow:
                  language === "de" ? "AUTO KOLLEKTION" : "CAR COLLECTION",
                title:
                  language === "de" ? "Autoduft" : "Car Fragrance",
                text:
                  language === "de"
                    ? "Verwandle jede Fahrt in ein exklusives Dufterlebnis. Demnächst verfügbar."
                    : "Transform every journey into a luxurious fragrance experience. Coming soon.",
                action: "COMING SOON",
                comingSoon: true,
              },
            ].map((experience) => {
              const content = (
                <>
                  <span className="home-journey-number" aria-hidden="true">
                    {experience.number}
                  </span>

                  <div>
                    <p>{experience.eyebrow}</p>
                    <h3>{experience.title}</h3>
                    <span>{experience.text}</span>
                  </div>

                  <footer>
                    <strong>{experience.action}</strong>
                    <span aria-hidden="true">
                      {experience.comingSoon ? "✦" : "→"}
                    </span>
                  </footer>
                </>
              );

              return experience.comingSoon ? (
                <div
                  key={experience.href}
                  className="home-journey-card coming-soon-card"
                  aria-label={`${experience.title} - Coming Soon`}
                >
                  {content}
                </div>
              ) : (
                <Link
                  key={experience.href}
                  href={experience.href}
                  className="home-journey-card"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section home-category-section">
        <div className="home-container">
          <div className="home-heading-row">
            <div>
              <p className="eyebrow">{t.exploreLavie}</p>
              <h2>{t.shopByCollection}</h2>
            </div>
            <a href="#collection">{t.viewAll}</a>
          </div>

          <div className="home-category-grid">
            {[
              ["✦", t.signature],
              ["☾", t.oriental],
              ["❀", t.floral],
              ["♢", t.fresh],
              ["♨", t.woody],
              ["✧", t.new],
            ].map(([icon, label], index) => (
              <a
                key={label}
                href="#collection"
                className={index === 0 ? "is-active" : ""}
              >
                <span>{icon}</span>
                <strong>{label}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="collection"
        className="home-section collection home-collection"
      >
        <div className="home-container">
          <header className="home-section-heading">
            <p className="eyebrow">{t.ourCollection}</p>
            <h2>{t.signatureScent}</h2>
          </header>

          <div className="product-grid home-product-grid">
            {siteProducts.map((product) => (
              <article
                className="product-card home-product-card"
                key={product.id}
              >
                <Link
                  href={`/product/${product.slug || product.id}`}
                  className="product-image-wrap"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                </Link>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-desc">{product.description}</p>

                  <strong className="home-product-price">
                    €{product.price.toFixed(2)}
                  </strong>

                  <div className="product-actions">
                    <button
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        })
                      }
                    >
                      <span
                        className="product-action-icon"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H7" />
                          <circle cx="10" cy="20" r="1.3" />
                          <circle cx="18" cy="20" r="1.3" />
                        </svg>
                      </span>
                      <span>{t.addCart}</span>
                    </button>

                    <button onClick={() => buyNow(product)}>
                      <span
                        className="product-action-icon"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                          <path d="M5 10h14l-1 10H6L5 10Z" />
                        </svg>
                      </span>
                      <span>{t.buyNow}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
