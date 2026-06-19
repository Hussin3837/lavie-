"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../../components/CartContext";

function getNoteImage(note: string) {
  return `/products/notes/${note
    .toLowerCase()
    .replace(/\s+/g, "-")}.png`;
}

function getNoteItems(notes: string) {
  if (!notes) return [];

  return notes
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProductDetails({ product }: { product: any }) {
  const { addItem } = useCart();

  const mainImage = product.image_url || product.image;

  const gallery = [
  mainImage,
  product.image3 || mainImage,
];

  const [activeImage, setActiveImage] = useState(gallery[0]);

  const notes = product.notes || {
    top: "Citrus • Spices • Fresh Accords",
    heart: "Rose • Amber • Oriental Florals",
    base: "Oud • Woods • Musk • Vanilla",
  };

  async function buyNow() {
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
            image: mainImage,
            quantity: 1,
          },
        ],
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Checkout failed");
    }
  }

  return (
    <main className="product-page">
      <section className="product-detail-layout">

        <div className="product-gallery">

          <div className="product-detail-media">
            <img src={activeImage} alt={product.name} />
          </div>

          <div className="product-thumbs">
            {gallery.map((img: string, index: number) => (
              <button
                key={index}
                className={activeImage === img ? "thumb active" : "thumb"}
                onClick={() => setActiveImage(img)}
              >
                <img
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                />
              </button>
            ))}
          </div>

        </div>

        <div className="product-detail-content">

          <h1>{product.name}</h1>

          <div className="product-rating">
            ★★★★★ <span>Luxury Eau de Parfum</span>
          </div>

          <p className="product-detail-description">
            {product.description}
          </p>

          <div className="product-detail-price">
            €{product.price.toFixed(2)}
          </div>

          <div className="product-detail-actions">

            <button
              onClick={() =>
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: mainImage,
                })
              }
            >
              Add to Cart
            </button>

            <button onClick={buyNow}>
              Buy Now
            </button>

          </div>

          <div className="product-notes">

            {[
              {
                title: "Top Notes",
                value: notes.top,
              },

              {
                title: "Heart Notes",
                value: notes.heart,
              },

              {
                title: "Base Notes",
                value: notes.base,
              },

            ].map((group) => (

              <div key={group.title}>

                <span>{group.title}</span>

                <div className="note-icons-row">

                  {getNoteItems(group.value).map((note) => (

                    <div
                      className="note-icon-item"
                      key={note}
                    >

                      <img
                        src={getNoteImage(note)}
                        alt={note}
                        style={{
                          width: "140px",
                          height: "140px",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />

                      <small>{note}</small>

                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

          <div className="product-payment-box">

            <span>Payment Methods</span>

            <div>
              <small>Visa</small>
              <small>Mastercard</small>
              <small>PayPal</small>
              <small>Klarna</small>
              <small>Apple Pay</small>
              <small>Google Pay</small>
            </div>

          </div>

          <div className="related-products">

            <span>You may also like</span>

            <div>
              <Link href="/product/majestic-night">
                Majestic Night
              </Link>

              <Link href="/product/overdose">
                Overdose
              </Link>

              <Link href="/product/rimal">
                Rimal
              </Link>

              <Link href="/product/arabian-nights">
                Arabian Nights
              </Link>
            </div>

          </div>

        </div>

      </section>
    </main>
  );
}
