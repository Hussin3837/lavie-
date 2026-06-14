"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../../components/CartContext";

export default function ProductDetails({ product }: { product: any }) {
  const { addItem } = useCart();
  
const mainImage = product.image_url || product.image;

const gallery = product.gallery || [
  mainImage,
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ name: product.name, price: product.price, quantity: 1 }],
      }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Checkout failed");
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
          <p className="product-detail-eyebrow">EAU DE PARFUM · 50 ML</p>

          <div className="product-rating">★★★★★ <span>(48)</span></div>

          <h1>{product.name}</h1>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-price">€{product.price}</div>

          <div className="product-trust-row">
            <span>Free shipping in Germany</span>
            <span>Long lasting performance</span>
            <span>Secure payments</span>
          </div>

          <div className="product-detail-actions">
            <button
              onClick={() =>
                addItem({
  id: product.id || product.slug,
  name: product.name,
  price: product.price,
  image: product.image_url || product.image,
})
              }
            >
              ADD TO CART
            </button>

            <button onClick={buyNow}>BUY NOW</button>
          </div>

          <div className="product-notes">
            <div>
              <span>TOP NOTES</span>
              <p>{notes.top}</p>
            </div>
            <div>
              <span>HEART NOTES</span>
              <p>{notes.heart}</p>
            </div>
            <div>
              <span>BASE NOTES</span>
              <p>{notes.base}</p>
            </div>
          </div>

          <div className="product-story">
            <span>THE STORY</span>
            <p>
              {product.name} is crafted for a memorable presence — elegant,
              warm and unmistakably refined. A signature made to leave a
              lasting impression.
            </p>
          </div>

          <div className="product-payment-box">
            <span>SECURE EUROPEAN CHECKOUT</span>
            <div>
              <small>Visa</small>
              <small>Mastercard</small>
              <small>PayPal</small>
              <small>Klarna</small>
              <small>Apple Pay</small>
              <small>Google Pay</small>
              <small>SEPA</small>
              <small>iDEAL</small>
            </div>
          </div>

          <div className="related-products">
            <span>YOU MAY ALSO LIKE</span>
            <div>
              <Link href="/product/arabian-nights">Arabian Nights</Link>
              <Link href="/product/overdose">Overdose</Link>
              <Link href="/product/majestic-night">Majestic Night</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
