"use client";

import { useCart } from "./CartContext";
import { products } from "../lib/products";

type Props = {
  open: boolean;
  onClose: () => void;
};
export default function CartDrawer({ open, onClose }: Props) {
  const {
    items,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();

  if (!open) return null;

  async function checkout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();
   if (!res.ok) {
  alert(data.error || "Checkout failed");
  console.error("Checkout failed:", data);
  return;
}

if (data.url) {
  window.location.href = data.url;
} else {
  alert("No checkout URL returned");
  console.error("No checkout URL:", data);
}
  }

  return (
    <>
      <div onClick={onClose} style={overlay} />

      <aside style={drawer}>
        <div style={header}>
          <div>
            <p style={label}>LA VIE</p>
            <h2 style={title}>Your Cart</h2>
          </div>

          <button onClick={onClose} style={closeBtn}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div style={emptyBox}>
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {items.map((item) => {
             const normalizedId = item.id
  .toLowerCase()
  .trim()
  .replace(/\s+/g, "-");

const productData = products.find((p) => p.id === normalizedId);

const imageSrc = item.image || productData?.image;
             return (
  <div key={item.id} style={itemCard}>

    <div style={imageWrapper}>
      <img
        src={imageSrc || "/products/1783279737727-rimal.webp"}
        alt={item.name}
        style={itemImage}
      />
    </div>

    <div>
      <h3 style={itemTitle}>
        {item.name}
      </h3>
    </div>

  <div style={cartControlRow}>
  <p style={itemPrice}>
    €{item.price.toFixed(2)}
  </p>
