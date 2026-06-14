"use client";

import CinematicEffects from "../components/CinematicEffects";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../components/CartContext";
import CartDrawer from "../components/CartDrawer";
import { products } from "../lib/products";

const quickAnswers: Record<string, string> = {
  shipping:
    "Free shipping is available in Germany. European delivery options can be shown at checkout depending on the destination.",
  payment:
    "LA VIE checkout supports secure European payment methods through Stripe: Visa, Mastercard, Apple Pay, Google Pay, Klarna, PayPal, SEPA, iDEAL and Bancontact when available.",
  perfume:
    "All LA VIE fragrances are Eau de Parfum 50 ml, designed for a refined, elegant and long-lasting scent trail.",
  contact:
    "You can contact LA VIE by email at hussine@gmail.com. For orders, please include your name and order number.",
  recommendation:
    "For a warm oriental scent choose Arabian Nights or Majestic Night. For a fresher signature choose Santorini or Vision Elegante. For floral elegance choose Rose Oud or Eden Bloom.",
};

function getAiReply(message: string) {
  const text = message.toLowerCase();

  if (
    text.includes("ship") ||
    text.includes("delivery") ||
    text.includes("versand") ||
    text.includes("توصيل")
  )
    return quickAnswers.shipping;

  if (
    text.includes("pay") ||
    text.includes("visa") ||
    text.includes("klarna") ||
    text.includes("paypal") ||
    text.includes("دفع")
  )
    return quickAnswers.payment;

  if (
    text.includes("perfume") ||
    text.includes("scent") ||
    text.includes("عطر") ||
    text.includes("رائحة")
  )
    return quickAnswers.perfume;

  if (
    text.includes("recommend") ||
    text.includes("best") ||
    text.includes("suggest") ||
    text.includes("اختار") ||
    text.includes("رشح")
  )
    return quickAnswers.recommendation;

  if (
    text.includes("contact") ||
    text.includes("email") ||
    text.includes("تواصل")
  )
    return quickAnswers.contact;

  return "Welcome to LA VIE ✨ I can help you choose a fragrance, explain notes, shipping, payment methods, or order questions.";
}

export default function HomeClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      from: "ai",
      text: "Welcome to LA VIE ✨ I can help you choose the perfect fragrance.",
    },
  ]);

  const { addItem, count, isCartOpen, openCart, closeCart } = useCart();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {
      // Muted autoplay can still be blocked on some browsers.
    });
  }, []);

  async function buyNow(product: any) {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      alert(data.error || "Checkout failed");
    } catch {
      alert("Checkout failed");
    }
  }

  function sendAiMessage() {
    const trimmed = aiInput.trim();
    if (!trimmed) return;

    const reply = getAiReply(trimmed);

    setAiMessages((current) => [
      ...current,
      { from: "user", text: trimmed },
      { from: "ai", text: reply },
    ]);

    setAiInput("");
  }

  return (
    <main className="lavie-page">
      <CinematicEffects />

      <CartDrawer open={isCartOpen} onClose={closeCart} />

      <header className="topbar">
        <a href="#home" className="brandmark" aria-label="LA VIE home">
          <img
            src="/images/logo.png"
            alt="LA VIE"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span>LA VIE</span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button onClick={openCart}>Cart ({count})</button>
        </nav>
      </header>

      <section id="home" className="hero">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="hero-video"
          poster="/products/Majestic Night.png"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="hero-overlay" />

        <div className="hero-content hero-content-minimal">
          <img
            className="hero-main-logo"
            src="/images/logo.png"
            alt="LA VIE"
          />

          <p className="hero-text">
            Premium fragrances crafted with passion and the finest ingredients.
          </p>

          <div className="hero-actions">
            <a href="#collection" className="hero-btn">
              Shop Collection
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-bottle-glow"></div>
          <img src="/products/Majestic Night.png" alt="" />
        </div>

        <div className="hero-feature-strip">
          <span>Free Shipping in Germany</span>
          <span>Premium Ingredients</span>
          <span>Long Lasting Scent</span>
          <span>Secure European Checkout</span>
        </div>
      </section>

      <section className="scent-finder-section">
        <p className="eyebrow">Find Your Signature</p>
        <h2>Choose the mood of your scent</h2>

        <div className="scent-finder-grid">
          <a href="#collection" className="scent-card">
            <span>01</span>
            <h3>Floral</h3>
            <p>Rose, white flowers and soft sensual elegance.</p>
          </a>

          <a href="#collection" className="scent-card">
            <span>02</span>
            <h3>Oriental</h3>
            <p>Warm amber, oud, woods and evening mystery.</p>
          </a>

          <a href="#collection" className="scent-card">
            <span>03</span>
            <h3>Fresh</h3>
            <p>Citrus, marine air and bright modern freshness.</p>
          </a>
        </div>
      </section>

      <section id="collection" className="collection">
        <p className="eyebrow">Our Collection</p>
        <h2>Discover Your Signature Scent</h2>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
             <Link
  href={/product/${product.slug || product.id}}
  className="product-image-wrap"
>
                <img src={product.image} alt={product.name} />
              </Link>

              <div className="product-info">
                <p className="product-type">LA VIE</p>
                <h3>{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <strong>€{product.price.toFixed(2)}</strong>

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
                    Add to Cart
                  </button>

                  <button onClick={() => buyNow(product)}>Buy Now</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="brand-story-section">
        <div className="brand-story-copy">
          <p className="eyebrow">The Art of Perfumery</p>
          <h2>Every fragrance tells a story</h2>
          <p>
            At LA VIE, every fragrance is crafted to become a memory. Inspired
            by elegance, mystery and timeless beauty, our perfumes are designed
            to leave a refined signature wherever life takes you.
          </p>
        </div>

        <div className="brand-story-card">
          <img src="/products/Arabian Nights.png" alt="LA VIE luxury perfume" />
          <div>
            <span>Luxury Perfume House</span>
            <strong>Made for unforgettable presence</strong>
          </div>
        </div>
      </section>

      <footer id="contact" className="luxury-footer">
        <div>
          <h3>LA VIE</h3>
          <p>
            Luxury Perfume House crafted for elegant, long-lasting and memorable
            scent experiences.
          </p>
        </div>

        <div>
          <h4>Contact us</h4>
          <a href="mailto:hussine@gmail.com">hussine@gmail.com</a>
          <p>Germany</p>
        </div>

        <div>
          <h4>Follow us on</h4>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer">
            TikTok
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            YouTube
          </a>
        </div>

        <div>
          <h4>We accept</h4>
          <div className="payment-badges">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>Klarna</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
            <span>SEPA</span>
            <span>iDEAL</span>
          </div>
        </div>
      </footer>

      <button
        className="ai-float-button"
        onClick={() => setAiOpen((open) => !open)}
      >
        AI
      </button>

      {aiOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div>
              <span>LA VIE</span>
              <strong>AI Assistant</strong>
            </div>

            <button onClick={() => setAiOpen(false)}>×</button>
          </div>

          <div className="ai-chat-messages">
            {aiMessages.map((message, index) => (
              <p
                key={index}
                className={message.from === "ai" ? "ai-message" : "user-message"}
              >
                {message.text}
              </p>
            ))}
          </div>

          <div className="ai-chat-input">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendAiMessage();
              }}
              placeholder="Ask about perfumes, shipping or payment..."
            />

            <button onClick={sendAiMessage}>Send</button>
          </div>
        </div>
      )}
    </main>
  );
}
