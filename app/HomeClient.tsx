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
  shipping:
    "Free shipping is available in Germany.",
  payment:
    "LA VIE supports Visa, Mastercard, Apple Pay, Google Pay, Klarna and PayPal.",
  perfume:
    "All LA VIE fragrances are Eau de Parfum 50ml with long lasting performance.",
  contact:
    "You can contact LA VIE at hussine@gmail.com",
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

  if (
    text.includes("contact") ||
    text.includes("email")
  ) {
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
    type: "image",
    src: "/hero/slide-1.jpg",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
  {
    type: "image",
    src: "/hero/slide-2.jpg",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
  {
    type: "video",
    src: "/videos/hero-video.mp4",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
  {
    type: "image",
    src: "/hero/slide-4.jpg",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
  {
    type: "image",
    src: "/hero/slide-5.jpg",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
  {
    type: "image",
    src: "/hero/slide-6.jpg",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
  {
    type: "image",
    src: "/hero/slide-7.jpg",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
  {
    type: "image",
    src: "/hero/slide-8.jpg",
    eyebrow: { en: "", de: "" },
    title: { en: "", de: "" },
    button: { en: "", de: "" },
  },
];

const translations = {
  en: {
    home: "Home", collection: "Collection", about: "About", contact: "Contact", cart: "Cart",
    shopCollection: "Shop Collection", freeShipping: "Free Shipping in Germany", premiumIngredients: "Premium Ingredients",
    longLasting: "Long Lasting Scent", secureCheckout: "Secure European Checkout", shopAll: "Shop All Perfumes",
    exploreCollection: "Explore the collection →", yourFormula: "YOUR FORMULA", createPerfume: "Create Your Perfume",
    formulaLine: "Oil + alcohol + bottle →", findVibe: "FIND YOUR VIBE", shopMood: "Shop by Mood",
    discoverScent: "Discover your scent →", mostLoved: "MOST LOVED", bestSellers: "Best Sellers",
    discoverFavorites: "Discover favorites →", exploreLavie: "Explore LA VIE", shopByCollection: "Shop by Collection",
    viewAll: "View all fragrances →", signature: "Signature", oriental: "Oriental", floral: "Floral", fresh: "Fresh", woody: "Woody", new: "New",
    atelier: "The LA VIE Atelier", createOwn: "Create Your Own Perfume",
    createText: "Build your fragrance ritual your way. Choose a perfume oil, pair it with perfumer's alcohol, select your bottle, and create a scent experience that belongs to you.",
    step1: "Choose your perfume oil", step2: "Select alcohol & concentration", step3: "Choose your bottle", startCreating: "Start Creating",
    yourPerfume: "YOUR PERFUME", oil: "OIL", alcohol: "ALCOHOL", madeByYou: "Made by you. Finished by LA VIE.",
    ourCollection: "Our Collection", signatureScent: "Discover Your Signature Scent", addCart: "Add to Cart", buyNow: "Buy Now"
  },
  de: {
    home: "Start", collection: "Kollektion", about: "Über uns", contact: "Kontakt", cart: "Warenkorb",
    shopCollection: "Kollektion entdecken", freeShipping: "Kostenloser Versand in Deutschland", premiumIngredients: "Hochwertige Inhaltsstoffe",
    longLasting: "Lang anhaltender Duft", secureCheckout: "Sicherer europäischer Checkout", shopAll: "Alle Parfums",
    exploreCollection: "Kollektion entdecken →", yourFormula: "DEINE FORMEL", createPerfume: "Kreiere dein Parfum",
    formulaLine: "Öl + Alkohol + Flakon →", findVibe: "FINDE DEINEN STIL", shopMood: "Nach Stimmung wählen",
    discoverScent: "Deinen Duft entdecken →", mostLoved: "AM BELIEBTESTEN", bestSellers: "Bestseller",
    discoverFavorites: "Favoriten entdecken →", exploreLavie: "LA VIE entdecken", shopByCollection: "Nach Kollektion shoppen",
    viewAll: "Alle Düfte ansehen →", signature: "Signature", oriental: "Orientalisch", floral: "Blumig", fresh: "Frisch", woody: "Holzig", new: "Neu",
    atelier: "Das LA VIE Atelier", createOwn: "Kreiere dein eigenes Parfum",
    createText: "Gestalte dein Duftritual ganz nach deinen Wünschen. Wähle ein Parfumöl, kombiniere es mit Parfümeuralkohol, entscheide dich für einen Flakon und erschaffe deinen persönlichen Duft.",
    step1: "Parfumöl wählen", step2: "Alkohol und Konzentration wählen", step3: "Flakon wählen", startCreating: "Jetzt kreieren",
    yourPerfume: "DEIN PARFUM", oil: "ÖL", alcohol: "ALKOHOL", madeByYou: "Von dir kreiert. Von LA VIE vollendet.",
    ourCollection: "Unsere Kollektion", signatureScent: "Entdecke deinen Signaturduft", addCart: "In den Warenkorb", buyNow: "Jetzt kaufen"
  }
} as const;

export default function HomeClient() {

  const touchStartX = useRef<number | null>(null);
  const heroVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const [siteProducts, setSiteProducts] = useState<StoreProduct[]>(initialProducts);

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
    const savedTheme = window.localStorage.getItem("lavie-theme") as ThemeMode | null;
    const savedLanguage = window.localStorage.getItem("lavie-language") as Language | null;
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

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
        console.error("Could not load products from Supabase:", error.message);
        return;
      }

      const loadedProducts: StoreProduct[] = (data ?? []).map((product: any) => ({
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
      }));

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
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
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
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
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

    }

    catch {

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

    <main className={`lavie-page theme-${theme}`}>

      <CinematicEffects />

      <CartDrawer

        open={isCartOpen}

        onClose={closeCart}

      />



      <header className="topbar">

        <a

          href="#home"

          className="brandmark"

        >

          <img

            src="/images/logo.png"

            alt="LA VIE"

          />

          <span>LA VIE</span>

        </a>



        <nav>

          <a href="#home">

            {t.home}

          </a>

          <a href="#collection">

            {t.collection}

          </a>

          <a href="#about">

            {t.about}

          </a>

          <a href="#contact">

            {t.contact}

          </a>

          <button

            onClick={openCart}

          >

            {t.cart} ({count})

          </button>

          <div className="site-controls" aria-label="Site preferences">
            <button
              type="button"
              className="language-toggle"
              onClick={() => setLanguage((current) => current === "en" ? "de" : "en")}
              aria-label={language === "en" ? "Deutsch wählen" : "Switch to English"}
              title={language === "en" ? "Deutsch" : "English"}
            >
              {language === "en" ? "DE" : "EN"}
            </button>

            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
          </div>

        </nav>

      </header>



      <section
        id="home"
        className="hero hero-slider"
        onTouchStart={handleHeroTouchStart}
        onTouchEnd={handleHeroTouchEnd}
      >
        <div className="hero-slides" aria-live="polite">
          {heroSlides.map((slide, index) => (
            <div
              key={`${slide.src}-${index}`}
              className={`hero-slide ${index === activeHeroSlide ? "is-active" : ""}`}
              aria-hidden={index !== activeHeroSlide}
            >
              {slide.type === "video" ? (
                <video
                  ref={(element) => {
                    heroVideoRefs.current[index] = element;
                  }}
                  muted
                  playsInline
                  preload="auto"
                  className="hero-media"
                  onCanPlay={(event) => {
                    if (index !== activeHeroSlide) return;
                    event.currentTarget.muted = true;
                    event.currentTarget.play().catch(() => {});
                  }}
                  onEnded={() => {
                    setActiveHeroSlide((current) =>
                      (current + 1) % heroSlides.length
                    );
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

        <button
          type="button"
          className="hero-arrow hero-arrow-left"
          onClick={showPreviousHeroSlide}
          aria-label="Previous hero slide"
        >
          ‹
        </button>
        <button
          type="button"
          className="hero-arrow hero-arrow-right"
          onClick={showNextHeroSlide}
          aria-label="Next hero slide"
        >
          ›
        </button>

        <div className="hero-dots" aria-label="Hero slides">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              className={index === activeHeroSlide ? "is-active" : ""}
              onClick={() => setActiveHeroSlide(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === activeHeroSlide ? "true" : undefined}
            />
          ))}
        </div>

      </section>

      <section className="shop-collection-showcase">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">{t.exploreLavie}</p>
            <h2>{t.shopByCollection}</h2>
          </div>
          <a href="#collection">{t.viewAll}</a>
        </div>

        <div className="collection-shortcuts">
          <a href="#collection" className="collection-shortcut active">
            <span>✦</span>
            <strong>{t.signature}</strong>
          </a>
          <a href="#collection" className="collection-shortcut">
            <span>☾</span>
            <strong>{t.oriental}</strong>
          </a>
          <a href="#collection" className="collection-shortcut">
            <span>❀</span>
            <strong>{t.floral}</strong>
          </a>
          <a href="#collection" className="collection-shortcut">
            <span>♢</span>
            <strong>{t.fresh}</strong>
          </a>
          <a href="#collection" className="collection-shortcut">
            <span>♨</span>
            <strong>{t.woody}</strong>
          </a>
          <a href="#collection" className="collection-shortcut">
            <span>✧</span>
            <strong>{t.new}</strong>
          </a>
        </div>
      </section>

      <section id="create-your-perfume" className="create-perfume-section">
        <div className="create-perfume-copy">
          <p className="eyebrow">{t.atelier}</p>
          <h2>{t.createOwn}</h2>
          <p>{t.createText}</p>

          <div className="create-steps">
            <div><span>01</span><strong>{t.step1}</strong></div>
            <div><span>02</span><strong>{t.step2}</strong></div>
            <div><span>03</span><strong>{t.step3}</strong></div>
          </div>

          <Link href="/create-your-perfume" className="create-perfume-btn">
            {t.startCreating}
          </Link>
        </div>

        <div className="create-perfume-visual">
          <div className="atelier-orbit orbit-one" />
          <div className="atelier-orbit orbit-two" />
          <div className="atelier-bottle">
            <span>LA VIE</span>
            <small>{t.yourPerfume}</small>
          </div>
          <div className="atelier-item atelier-oil">{t.oil}</div>
          <div className="atelier-item atelier-alcohol">{t.alcohol}</div>
          <div className="atelier-caption">{t.madeByYou}</div>
        </div>
      </section>

      <section
        aria-labelledby="fragrance-experiences-title"
        style={{
          padding: "96px 24px",
          background:
            "radial-gradient(circle at top, rgba(215,178,122,.12), transparent 38%), linear-gradient(180deg, #090909 0%, #030303 100%)",
          borderTop: "1px solid rgba(215,178,122,.18)",
          borderBottom: "1px solid rgba(215,178,122,.18)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 46 }}>
            <p
              className="eyebrow"
              style={{ marginBottom: 12, letterSpacing: ".26em" }}
            >
              LA VIE EXPERIENCES
            </p>
            <h2
              id="fragrance-experiences-title"
              style={{
                margin: 0,
                fontSize: "clamp(2rem, 4vw, 4rem)",
                fontWeight: 500,
              }}
            >
              Choose Your Fragrance Journey
            </h2>
            <p
              style={{
                maxWidth: 680,
                margin: "18px auto 0",
                opacity: 0.72,
                lineHeight: 1.8,
              }}
            >
              Create a personal perfume, transform your home, or bring a refined
              signature scent to your car.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 22,
            }}
          >
            {[
              {
                href: "/create-your-perfume",
                number: "01",
                eyebrow: "PERSONAL ATELIER",
                title: "Create Your Perfume",
                text: "Choose your bottle, fragrance oil, concentration and personalized label.",
                action: "Start creating",
              },
              {
                href: "/home-fragrance",
                number: "02",
                eyebrow: "HOME COLLECTION",
                title: "Home Fragrance",
                text: "Design an elegant atmosphere for your home with your preferred scent, size and strength.",
                action: "Explore home fragrance",
              },
              {
                href: "/car-fragrance",
                number: "03",
                eyebrow: "CAR COLLECTION",
                title: "Car Fragrance",
                text: "Select a car spray, hanging diffuser or vent diffuser and create your ideal intensity.",
                action: "Explore car fragrance",
              },
            ].map((experience) => (
              <Link
                key={experience.href}
                href={experience.href}
                style={{
                  position: "relative",
                  minHeight: 390,
                  padding: "34px 30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid rgba(215,178,122,.3)",
                  borderRadius: 28,
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.012))",
                  boxShadow: "0 26px 80px rgba(0,0,0,.28)",
                  transition: "transform .3s ease, border-color .3s ease, box-shadow .3s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateY(-8px)";
                  event.currentTarget.style.borderColor = "rgba(215,178,122,.72)";
                  event.currentTarget.style.boxShadow = "0 34px 90px rgba(0,0,0,.42)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.borderColor = "rgba(215,178,122,.3)";
                  event.currentTarget.style.boxShadow = "0 26px 80px rgba(0,0,0,.28)";
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: 18,
                    top: -18,
                    fontSize: "clamp(6rem, 11vw, 10rem)",
                    lineHeight: 1,
                    color: "rgba(215,178,122,.08)",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {experience.number}
                </span>

                <div style={{ position: "relative", zIndex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      letterSpacing: ".22em",
                      color: "#d7b27a",
                    }}
                  >
                    {experience.eyebrow}
                  </p>
                  <h3
                    style={{
                      margin: "22px 0 16px",
                      fontSize: "clamp(1.7rem, 3vw, 2.6rem)",
                      fontWeight: 500,
                    }}
                  >
                    {experience.title}
                  </h3>
                  <p style={{ margin: 0, lineHeight: 1.8, opacity: 0.72 }}>
                    {experience.text}
                  </p>
                </div>

                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 28,
                    borderTop: "1px solid rgba(215,178,122,.18)",
                  }}
                >
                  <strong style={{ color: "#d7b27a", fontWeight: 600 }}>
                    {experience.action}
                  </strong>
                  <span aria-hidden="true" style={{ fontSize: 24 }}>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section

        id="collection"

        className="collection"

      >

        <p className="eyebrow">

          {t.ourCollection}

        </p>



        <h2>

          {t.signatureScent}

        </h2>



        <div className="product-grid">

          {siteProducts.map((product) => (

            <article

              className="product-card"

              key={product.id}

            >

              <Link

                href={`/product/${product.slug || product.id}`}

                className="product-image-wrap"

              >

                <img

                  src={product.image}

                  alt={product.name}

                />

              </Link>



              <div className="product-info">

               



                <h3>

                  {product.name}

                </h3>



                <p className="product-desc">

                  {product.description}

                </p>



                <strong>

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
                    <span className="product-action-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H7" />
                        <circle cx="10" cy="20" r="1.3" />
                        <circle cx="18" cy="20" r="1.3" />
                      </svg>
                    </span>
                    <span>{t.addCart}</span>
                  </button>



                  <button

                    onClick={() =>

                      buyNow(product)

                    }

                  >
                    <span className="product-action-icon" aria-hidden="true">
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

      </section>

    </main>

  );

}
