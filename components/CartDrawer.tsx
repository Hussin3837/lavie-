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
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Checkout failed");
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

    <img
      src={imageSrc || "/products/Rimal.png"}
      alt={item.name}
      style={itemImage}
    />

    <div>
      <h3 style={itemTitle}>
        {item.name}
      </h3>

      <p style={itemPrice}>
        €{item.price.toFixed(2)}
      </p>
    </div>

   <div style={qtyRow}>
  <button
    onClick={() => decreaseQuantity(item.id)}
    style={qtyBtn}
  >
    −
  </button>

  <span style={qtyNumber}>{item.quantity}</span>

  <button
    onClick={() => increaseQuantity(item.id)}
    style={qtyBtn}
  >
    +
  </button>
</div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={removeBtn}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={footer}>
          <div style={summaryRow}>
            <span>Subtotal</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          <div style={summaryRow}>
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div style={divider} />

          <div style={totalRow}>
            <span>Total</span>
            <strong>€{total.toFixed(2)}</strong>
          </div>

          <div style={paymentIntro}>Secure European checkout accepts</div>

          <div style={paymentBadges}>
            <span style={paymentBadge}>Visa</span>
            <span style={paymentBadge}>Mastercard</span>
            <span style={paymentBadge}>PayPal</span>
            <span style={paymentBadge}>Klarna</span>
            <span style={paymentBadge}>Apple Pay</span>
            <span style={paymentBadge}>Google Pay</span>
            <span style={paymentBadge}>SEPA</span>
            <span style={paymentBadge}>iDEAL</span>
          </div>

          <button
            onClick={checkout}
            disabled={items.length === 0}
            style={{
              ...checkoutBtn,
              opacity: items.length === 0 ? 0.45 : 1,
              cursor: items.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            CHECKOUT
          </button>
        </div>
      </aside>
    </>
  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,.58)",
  backdropFilter: "blur(10px)",
  zIndex: 9998,
};

const drawer = {
  position: "fixed" as const,
  top: 0,
  right: 0,
  width: "min(460px, 100vw)",
  height: "100vh",
  background:
    "linear-gradient(180deg, rgba(13,13,13,.98), rgba(5,5,5,.96))",
  color: "#f5f0e8",
  padding: 30,
  zIndex: 9999,
  overflowY: "auto" as const,
  boxShadow: "-30px 0 90px rgba(0,0,0,.75)",
  borderLeft: "1px solid rgba(179,138,82,.22)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 34,
};

const label = {
  color: "#b38a52",
  letterSpacing: 5,
  fontSize: 11,
  marginBottom: 8,
};

const title = {
  fontSize: 42,
  fontWeight: 300,
  margin: 0,
};

const closeBtn = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,.16)",
  color: "#fff",
  width: 42,
  height: 42,
  borderRadius: "50%",
  fontSize: 24,
  cursor: "pointer",
};

const emptyBox = {
  padding: 24,
  border: "1px solid rgba(255,255,255,.1)",
  background: "rgba(255,255,255,.03)",
  borderRadius: 20,
  opacity: 0.7,
};

const itemCard = {
  padding: 22,
  border: "1px solid rgba(179,138,82,.18)",
  background: "rgba(255,255,255,.035)",
  borderRadius: 24,
  backdropFilter: "blur(18px)",
};

const itemImage = {
  width: "100%",
  height: "300px",

  objectFit: "contain" as const,
  objectPosition: "center",

  transform: "scale(1.12)",

  borderRadius: "18px",
  border: "1px solid #f4d49c",

  boxShadow:
    "0 0 25px rgba(244,212,156,.22), inset 0 0 15px rgba(244,212,156,.08)",

  background:
    "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01))",

  padding: "0",
}

const itemTitle = {
  fontSize: 22,
  fontWeight: 300,
  margin: "0 0 8px",
};

const itemPrice = {
  color: "#d7b27a",
  margin: 0,
  fontSize: 18,
};

const qtyRow = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginTop: 18,
};

const qtyBtn = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,.18)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontSize: 18,
};

const qtyNumber = {
  minWidth: 20,
  textAlign: "center" as const,
  fontSize: 18,
};

const removeBtn = {
  marginTop: 16,
  background: "transparent",
  border: 0,
  color: "#b38a52",
  cursor: "pointer",
  letterSpacing: 1,
};

const footer = {
  marginTop: 34,
  paddingTop: 24,
  borderTop: "1px solid rgba(255,255,255,.12)",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 14,
  color: "#cfcfcf",
  fontSize: 18,
};

const divider = {
  height: 1,
  background: "rgba(255,255,255,.1)",
  margin: "18px 0",
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 22,
  marginBottom: 20,
};

const checkoutBtn = {
  width: "100%",
  padding: 22,
  background:
    "linear-gradient(135deg,#e3c084,#b38a52,#f0d49a)",
  border: 0,
  borderRadius: 18,
  color: "#111",
  fontWeight: 700,
  letterSpacing: 4,
  fontSize: 16,
};


const paymentIntro = {
  color: "rgba(245,240,232,.72)",
  fontSize: 12,
  letterSpacing: 1.5,
  textTransform: "uppercase" as const,
  marginBottom: 12,
};

const paymentBadges = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 8,
  marginBottom: 18,
};

const paymentBadge = {
  border: "1px solid rgba(215,178,122,.24)",
  background: "rgba(255,255,255,.04)",
  color: "#f5f0e8",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 11,
};
