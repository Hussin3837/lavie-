"use client";

import CinematicEffects from "../components/CinematicEffects";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../components/CartContext";
import CartDrawer from "../components/CartDrawer";
import { products } from "../lib/products";

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

  const {

    addItem,

    count,

    isCartOpen,

    openCart,

    closeCart,

  } = useCart();


  useEffect(() => {

    const video = videoRef.current;

    if (!video) return;

    video.muted = true;

    video.play().catch(() => {});

  }, []);


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

    <main className="lavie-page">

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

            Home

          </a>

          <a href="#collection">

            Collection

          </a>

          <a href="#about">

            About

          </a>

          <a href="#contact">

            Contact

          </a>

          <button

            onClick={openCart}

          >

            Cart ({count})

          </button>

        </nav>

      </header>



      <section

        id="home"

        className="hero"

      >

        <video

          ref={videoRef}

          autoPlay

          muted

          loop

          playsInline

          className="hero-video"

        >

          <source

            src="/videos/hero-video.mp4"

            type="video/mp4"

          />

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

            <a

              href="#collection"

              className="hero-btn"

            >

              Shop Collection

            </a>

          </div>

        </div>



        <div className="hero-feature-strip">

          <span>

            Free Shipping in Germany

          </span>

          <span>

            Premium Ingredients

          </span>

          <span>

            Long Lasting Scent

          </span>

          <span>

            Secure European Checkout

          </span>

        </div>

      </section>



      <section

        id="collection"

        className="collection"

      >

        <p className="eyebrow">

          Our Collection

        </p>



        <h2>

          Discover Your Signature Scent

        </h2>



        <div className="product-grid">

          {products.map((product) => (

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

                <p className="product-type">

                  LA VIE

                </p>



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

                    Add to Cart

                  </button>



                  <button

                    onClick={() =>

                      buyNow(product)

                    }

                  >

                    Buy Now

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
