"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  active: boolean | null;
  created_at: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,.04)",
  color: "#f5f0e8",
  border: "1px solid rgba(215,178,122,.24)",
  padding: "13px 14px",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  padding: "12px 18px",
  fontWeight: 800,
  cursor: "pointer",
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("49");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  async function loadProducts() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setProducts([]);
    } else {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function addProduct() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter product name.");
      return;
    }

    setSaving(true);

    const slug = makeSlug(name);

    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      slug,
      price: Number(price) || 0,
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      active: true,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Product added successfully.");
      setName("");
      setPrice("49");
      setDescription("");
      setImageUrl("");
      setVideoUrl("");
      await loadProducts();
    }

    setSaving(false);
  }

  async function toggleProduct(product: Product) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("products")
      .update({ active: !product.active })
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      await loadProducts();
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("products").delete().eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Product deleted successfully.");
      await loadProducts();
    }
  }

  const activeProducts = products.filter((product) => product.active).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, rgba(215,178,122,.14), #050505 45%)",
        color: "#f5f0e8",
        padding: "48px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "36px" }}>
        <div>
          <h1 style={{ fontSize: "56px", marginBottom: "12px", fontFamily: "Georgia, serif", fontWeight: 400 }}>
            LA VIE Admin
          </h1>
          <p style={{ color: "#d7b27a" }}>Luxury perfume store management dashboard</p>
        </div>

        <button
          onClick={loadProducts}
          style={{
            ...buttonStyle,
            alignSelf: "flex-start",
            background: "transparent",
            color: "#d7b27a",
            border: "1px solid rgba(215,178,122,.45)",
          }}
        >
          Refresh
        </button>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "18px",
          marginBottom: "36px",
        }}
      >
        <div style={{ border: "1px solid rgba(215,178,122,.28)", padding: "24px", background: "rgba(0,0,0,.22)" }}>
          <small style={{ color: "#d7b27a", letterSpacing: "2px" }}>Products</small>
          <h2 style={{ fontSize: "34px", marginTop: "12px" }}>{products.length}</h2>
        </div>

        <div style={{ border: "1px solid rgba(215,178,122,.28)", padding: "24px", background: "rgba(0,0,0,.22)" }}>
          <small style={{ color: "#d7b27a", letterSpacing: "2px" }}>Active</small>
          <h2 style={{ fontSize: "34px", marginTop: "12px" }}>{activeProducts}</h2>
        </div>

        <div style={{ border: "1px solid rgba(215,178,122,.28)", padding: "24px", background: "rgba(0,0,0,.22)" }}>
          <small style={{ color: "#d7b27a", letterSpacing: "2px" }}>Orders</small>
          <h2 style={{ fontSize: "34px", marginTop: "12px" }}>0</h2>
        </div>

        <div style={{ border: "1px solid rgba(215,178,122,.28)", padding: "24px", background: "rgba(0,0,0,.22)" }}>
          <small style={{ color: "#d7b27a", letterSpacing: "2px" }}>Revenue</small>
          <h2 style={{ fontSize: "34px", marginTop: "12px" }}>€0</h2>
        </div>
      </section>

      {(errorMessage || successMessage) && (
        <div
          style={{
            padding: "16px 18px",
            marginBottom: "24px",
            border: `1px solid ${errorMessage ? "rgba(255,90,90,.5)" : "rgba(120,255,170,.45)"}`,
            color: errorMessage ? "#ffb3b3" : "#b6ffd0",
            background: errorMessage ? "rgba(255,0,0,.08)" : "rgba(0,255,100,.06)",
          }}
        >
          {errorMessage || successMessage}
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div style={{ border: "1px solid rgba(215,178,122,.28)", padding: "28px", background: "rgba(0,0,0,.28)" }}>
          <h2 style={{ fontSize: "30px", marginBottom: "22px", fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Add New Perfume
          </h2>

          <div style={{ display: "grid", gap: "14px" }}>
            <input style={inputStyle} value={name} onChange={(event) => setName(event.target.value)} placeholder="Perfume name" />
            <input style={inputStyle} value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Price" type="number" />
            <textarea
              style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
            />
            <input style={inputStyle} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL" />
            <input style={inputStyle} value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Video URL" />

            <button
              onClick={addProduct}
              disabled={saving}
              style={{
                ...buttonStyle,
                background: "linear-gradient(90deg,#f4d49c,#b8873b)",
                color: "#111",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "+ Add New Perfume"}
            </button>
          </div>
        </div>

        <div style={{ border: "1px solid rgba(215,178,122,.28)", padding: "28px", background: "rgba(0,0,0,.28)" }}>
          <h2 style={{ fontSize: "30px", marginBottom: "22px", fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Product Management
          </h2>

          {loading ? (
            <p style={{ color: "rgba(245,240,232,.7)" }}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ color: "rgba(245,240,232,.7)" }}>No products in Supabase yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr auto",
                    gap: "16px",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,.12)",
                    padding: "14px",
                    background: product.active ? "rgba(255,255,255,.025)" : "rgba(255,0,0,.06)",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      border: "1px solid rgba(215,178,122,.22)",
                      background: "rgba(255,255,255,.04)",
                      overflow: "hidden",
                    }}
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>

                  <div>
                    <strong style={{ display: "block", fontSize: "18px", marginBottom: "6px" }}>{product.name}</strong>
                    <small style={{ color: "#d7b27a" }}>€{product.price || 0}</small>
                    <p style={{ marginTop: "8px", color: "rgba(245,240,232,.62)", fontSize: "13px", maxWidth: "720px" }}>
                      {product.description || "No description"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => toggleProduct(product)}
                      style={{ ...buttonStyle, background: "transparent", color: "#d7b27a", border: "1px solid rgba(215,178,122,.35)" }}
                    >
                      {product.active ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => deleteProduct(product)}
                      style={{ ...buttonStyle, background: "rgba(255,0,0,.12)", color: "#ffb3b3", border: "1px solid rgba(255,90,90,.35)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
