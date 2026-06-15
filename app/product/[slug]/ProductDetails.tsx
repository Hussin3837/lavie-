"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../../components/CartContext"; 

export default function ProductDetails({ product }: { product: any }) {
  const { addItem } = useCart();

  const mainImage = product.image_url || product.image;
  const gallery = product.gallery || [mainImage, mainImage, mainImage];
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
              <button key={index} onClick={() => setActiveImage(img)}>
                <img src={img} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail-content">
          <p className="product-detail-eyebrow">LA VIE</p>

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

          <div className="product-trust-row">
            <span>50 ML Eau de Parfum</span>
            <span>Long Lasting Scent</span>
            <span>Secure Checkout</span>
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
            <div>
              <span>Top Notes</span>
              <p>{notes.top}</p>
            </div>

            <div>
              <span>Heart Notes</span>
              <p>{notes.heart}</p>
            </div>

            <div>
              <span>Base Notes</span>
              <p>{notes.base}</p>
            </div>
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
              <Link href="/product/majestic-night">Majestic Night</Link>
              <Link href="/product/overdose">Overdose</Link>
              <Link href="/product/rimal">Rimal</Link>
              <Link href="/product/arabian-nights">Arabian Nights</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
