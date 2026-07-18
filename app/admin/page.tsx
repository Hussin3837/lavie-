"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import CarFragranceAdminPanel from "../../components/CarFragranceAdminPanel";
import { supabase } from "../../lib/supabase";
import AdminOrdersPanel from "../../components/AdminOrdersPanel";
import CustomPerfumeAdminPanel from "../../components/CustomPerfumeAdminPanel";
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

type SortMode = "newest" | "oldest" | "name" | "priceHigh" | "priceLow" | "active";

const gold = "#d7b27a";
const cream = "#f5f0e8";

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,.045)",
  color: cream,
  border: "1px solid rgba(215,178,122,.26)",
  padding: "13px 14px",
  outline: "none",
  borderRadius: "12px",
};

const buttonStyle: CSSProperties = {
  border: "none",
  padding: "12px 18px",
  fontWeight: 800,
  cursor: "pointer",
  borderRadius: "999px",
};

const cardStyle: CSSProperties = {
  border: "1px solid rgba(215,178,122,.26)",
  background: "linear-gradient(180deg, rgba(255,255,255,.045), rgba(0,0,0,.25))",
  boxShadow: "0 24px 80px rgba(0,0,0,.22)",
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPrice(value: number | null) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("49");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [active, setActive] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgressText, setVideoProgressText] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

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

  function resetForm() {
    setEditingProductId(null);
    setName("");
    setPrice("49");
    setDescription("");
    setImageUrl("");
    setVideoUrl("");
    setActive(true);
    setUploadProgressText("");
    setVideoProgressText("");
  }

  function startEdit(product: Product) {
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgressText("");
    setVideoProgressText("");
    setEditingProductId(product.id);
    setName(product.name || "");
    setPrice(String(product.price ?? 0));
    setDescription(product.description || "");
    setImageUrl(product.image_url || "");
    setVideoUrl(product.video_url || "");
    setActive(Boolean(product.active));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateProduct() {
    const cleanName = name.trim();
    const cleanSlug = makeSlug(cleanName);

    if (!cleanName) return "Please enter product name.";
    if (!cleanSlug) return "Product name must contain English letters or numbers for the URL slug.";
    if (Number.isNaN(Number(price)) || Number(price) < 0) return "Please enter a valid price.";

    const slugExists = products.some(
      (product) => product.slug === cleanSlug && product.id !== editingProductId
    );

    if (slugExists) return "This product name already exists. Please use a unique name.";

    return "";
  }

  async function uploadProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgressText("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image is too large. Please choose an image under 5 MB.");
      event.target.value = "";
      return;
    }

    setUploadingImage(true);
    setUploadProgressText("Uploading image...");

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeSlug = makeSlug(name) || "lavie-product";
    const filePath = `${safeSlug}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setErrorMessage(uploadError.message);
      setUploadProgressText("");
      setUploadingImage(false);
      event.target.value = "";
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      setErrorMessage("Image uploaded, but the public URL could not be created.");
      setUploadProgressText("");
    } else {
      setImageUrl(data.publicUrl);
      setUploadProgressText("Image uploaded successfully. Save the product to keep it.");
    }

    setUploadingImage(false);
    event.target.value = "";
  }

  async function uploadProductVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");
    setVideoProgressText("");

    if (!file.type.startsWith("video/")) {
      setErrorMessage("Please choose a video file.");
      event.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("Video is too large. Please choose a video under 50 MB.");
      event.target.value = "";
      return;
    }

    setUploadingVideo(true);
    setVideoProgressText("Uploading video...");

    const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const safeSlug = makeSlug(name) || "lavie-video";
    const filePath = `${safeSlug}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setErrorMessage(uploadError.message);
      setVideoProgressText("");
      setUploadingVideo(false);
      event.target.value = "";
      return;
    }

    const { data } = supabase.storage
      .from("product-videos")
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      setErrorMessage("Video uploaded, but the public URL could not be created.");
      setVideoProgressText("");
    } else {
      setVideoUrl(data.publicUrl);
      setVideoProgressText("Video uploaded successfully. Save the product.");
    }

    setUploadingVideo(false);
    event.target.value = "";
  }

  async function saveProduct() {
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateProduct();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);

    const cleanName = name.trim();
    const payload = {
      name: cleanName,
      slug: makeSlug(cleanName),
      price: Number(price) || 0,
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      active,
    };

    const result = editingProductId
      ? await supabase.from("products").update(payload).eq("id", editingProductId)
      : await supabase.from("products").insert(payload);

    if (result.error) {
      setErrorMessage(result.error.message);
    } else {
      setSuccessMessage(editingProductId ? "Product updated successfully." : "Product added successfully.");
      resetForm();
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
      setSuccessMessage(product.active ? "Product hidden." : "Product is now visible.");
      await loadProducts();
    }
  }

  async function uploadImageForProduct(product: Product, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${product.slug || "product"}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setErrorMessage(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from("products")
      .update({ image_url: data.publicUrl })
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Image added successfully.");
      await loadProducts();
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("products").delete().eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Product deleted successfully.");
      if (editingProductId === product.id) resetForm();
      await loadProducts();
    }
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      if (!term) return true;
      return [product.name, product.slug, product.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });

    return [...result].sort((a, b) => {
      if (sortMode === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "priceHigh") return (b.price || 0) - (a.price || 0);
      if (sortMode === "priceLow") return (a.price || 0) - (b.price || 0);
      if (sortMode === "active") return Number(Boolean(b.active)) - Number(Boolean(a.active));
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [products, searchTerm, sortMode]);

  const activeProducts = products.filter((product) => product.active).length;
  const inactiveProducts = products.length - activeProducts;
  const averagePrice = products.length
    ? products.reduce((total, product) => total + (Number(product.price) || 0), 0) / products.length
    : 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(215,178,122,.18), transparent 32%), radial-gradient(circle at top right, rgba(255,255,255,.06), transparent 28%), #050505",
        color: cream,
        padding: "clamp(22px, 4vw, 48px)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={{ color: gold, letterSpacing: "4px", fontSize: "12px", marginBottom: "10px" }}>
            LA VIE CONTROL ROOM
          </p>
          <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", margin: 0, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "rgba(245,240,232,.72)", marginTop: "12px" }}>
            Manage products, prices, visibility and media from one place.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={resetForm}
            style={{
              ...buttonStyle,
              background: "rgba(255,255,255,.06)",
              color: cream,
              border: "1px solid rgba(255,255,255,.16)",
            }}
          >
            New Product
          </button>
          <button
            onClick={loadProducts}
            style={{
              ...buttonStyle,
              background: "transparent",
              color: gold,
              border: "1px solid rgba(215,178,122,.45)",
            }}
          >
            Refresh
          </button>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "16px",
          marginBottom: "26px",
        }}
      >
        {[
          ["Products", products.length],
          ["Active", activeProducts],
          ["Hidden", inactiveProducts],
          ["Average Price", formatPrice(averagePrice)],
        ].map(([label, value]) => (
          <div key={String(label)} style={{ ...cardStyle, padding: "22px", borderRadius: "18px" }}>
            <small style={{ color: gold, letterSpacing: "2px" }}>{label}</small>
            <h2 style={{ fontSize: "32px", margin: "12px 0 0" }}>{value}</h2>
          </div>
        ))}
      </section>

      {(errorMessage || successMessage) && (
  <div
    style={{
      padding: "16px 18px",
      marginBottom: "24px",
      borderRadius: "14px",
      border: errorMessage
        ? "1px solid rgba(255,90,90,.5)"
        : "1px solid rgba(120,255,170,.45)",
      color: errorMessage ? "#ffb3b3" : "#b6ffd0",
      background: errorMessage
        ? "rgba(255,0,0,.08)"
        : "rgba(0,255,100,.06)",
    }}
  >
    {errorMessage || successMessage}
  </div>
)}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 430px) 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div style={{ ...cardStyle, padding: "26px", borderRadius: "22px" }}>
          <h2 style={{ fontSize: "30px", margin: "0 0 8px", fontFamily: "Georgia, serif", fontWeight: 400 }}>
            {editingProductId ? "Edit Perfume" : "Add New Perfume"}
          </h2>

          <p style={{ color: "rgba(245,240,232,.62)", marginBottom: "22px", fontSize: "14px" }}>
            Slug preview: <span style={{ color: gold }}>{makeSlug(name) || "product-url"}</span>
          </p>

          <div style={{ display: "grid", gap: "14px" }}>
            <input style={inputStyle} value={name} onChange={(event) => setName(event.target.value)} placeholder="Perfume name" />

            <input
              style={inputStyle}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
            />

            <textarea
              style={{ ...inputStyle, minHeight: "115px", resize: "vertical" }}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
            />

            <input style={inputStyle} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL" />

            <label
              style={{
                ...buttonStyle,
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(215,178,122,.12)",
                color: gold,
                border: "1px solid rgba(215,178,122,.38)",
                opacity: uploadingImage ? 0.6 : 1,
              }}
            >
              {uploadingImage ? "Uploading image..." : "Choose Image from Computer"}
              <input
                type="file"
                accept="image/*"
                onChange={uploadProductImage}
                disabled={uploadingImage || saving}
                style={{ display: "none" }}
              />
            </label>

            {uploadProgressText ? (
              <small style={{ color: uploadProgressText.includes("successfully") ? "#b6ffd0" : gold }}>
                {uploadProgressText}
              </small>
            ) : null}

            <label
              style={{
                ...buttonStyle,
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(215,178,122,.12)",
                color: gold,
                border: "1px solid rgba(215,178,122,.38)",
                opacity: uploadingVideo ? 0.6 : 1,
              }}
            >
              {uploadingVideo ? "Uploading video..." : "Choose Video from Computer"}
              <input
                type="file"
                accept="video/*"
                onChange={uploadProductVideo}
                disabled={uploadingVideo || saving}
                style={{ display: "none" }}
              />
            </label>

            {videoProgressText ? (
              <small style={{ color: videoProgressText.includes("successfully") ? "#b6ffd0" : gold }}>
                {videoProgressText}
              </small>
            ) : null}

            <input style={inputStyle} value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Video URL" />

            <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(245,240,232,.8)", fontSize: "14px" }}>
              <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
              Product visible in store
            </label>

            {imageUrl.trim() ? (
              <div style={{ border: "1px solid rgba(215,178,122,.22)", borderRadius: "16px", overflow: "hidden", background: "rgba(255,255,255,.035)", minHeight: "160px", display: "grid", placeItems: "center" }}>
                <img src={imageUrl} alt="Product preview" style={{ width: "100%", maxHeight: "230px", objectFit: "contain", display: "block" }} />
              </div>
            ) : null}

           {videoUrl.trim() ? (
  <div style={{ display: "grid", gap: "10px" }}>
    <video
      src={videoUrl}
      controls
      muted
      style={{
        width: "100%",
        maxHeight: "230px",
        borderRadius: "16px",
        border: "1px solid rgba(215,178,122,.22)",
        background: "#000",
      }}
    />

    <button
      type="button"
      onClick={() => {
        setVideoUrl("");
        setVideoProgressText("Video removed. Save the product.");
      }}
      style={{
        ...buttonStyle,
        background: "rgba(255,0,0,.12)",
        color: "#ffb3b3",
        border: "1px solid rgba(255,90,90,.35)",
      }}
    >
      Remove Video
    </button>
  </div>
) : null}     

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={saveProduct}
                disabled={saving}
                style={{
                  ...buttonStyle,
                  flex: "1 1 180px",
                  background: "linear-gradient(90deg,#f4d49c,#b8873b)",
                  color: "#111",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : editingProductId ? "Save Changes" : "+ Add Perfume"}
              </button>

              {editingProductId ? (
                <button
                  onClick={resetForm}
                  disabled={saving}
                  style={{ ...buttonStyle, background: "rgba(255,255,255,.06)", color: cream, border: "1px solid rgba(255,255,255,.16)" }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: "26px", borderRadius: "22px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", marginBottom: "22px" }}>
            <div>
              <h2 style={{ fontSize: "30px", margin: 0, fontFamily: "Georgia, serif", fontWeight: 400 }}>
                Product Management
              </h2>
              <p style={{ color: "rgba(245,240,232,.62)", marginTop: "8px", fontSize: "14px" }}>
                Showing {filteredProducts.length} of {products.length} products.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                style={{ ...inputStyle, width: "min(270px, 100%)" }}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products..."
              />

              <select
                style={{ ...inputStyle, width: "190px" }}
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A-Z</option>
                <option value="priceHigh">Price high-low</option>
                <option value="priceLow">Price low-high</option>
                <option value="active">Active first</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "rgba(245,240,232,.7)" }}>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p style={{ color: "rgba(245,240,232,.7)" }}>No matching products found.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "76px minmax(220px, 1fr) auto",
                    gap: "16px",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: "18px",
                    padding: "14px",
                    background: product.active ? "rgba(255,255,255,.025)" : "rgba(255,0,0,.06)",
                  }}
                >
                  <div style={{ width: "76px", height: "76px", borderRadius: "14px", border: "1px solid rgba(215,178,122,.22)", background: "rgba(255,255,255,.04)", overflow: "hidden", display: "grid", placeItems: "center" }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <label style={{ color: gold, fontSize: "11px", cursor: "pointer", textAlign: "center" }}>
                        Upload Image
                        <input type="file" accept="image/*" onChange={(event) => uploadImageForProduct(product, event)} style={{ display: "none" }} />
                      </label>
                    )}
                  </div>

                  <div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={{ display: "block", fontSize: "18px" }}>{product.name}</strong>
                      <span
                        style={{
                          fontSize: "11px",
                          color: product.active ? "#b6ffd0" : "#ffb3b3",
                          border: `1px solid ${product.active ? "rgba(120,255,170,.35)" : "rgba(255,90,90,.35)"}`,
                          padding: "4px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        {product.active ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <small style={{ color: gold }}>
                      {formatPrice(product.price)} • /product/{product.slug}
                    </small>

                    <p style={{ margin: "8px 0 0", color: "rgba(245,240,232,.62)", fontSize: "13px", maxWidth: "780px" }}>
                      {product.description || "No description"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button onClick={() => startEdit(product)} style={{ ...buttonStyle, background: "rgba(255,255,255,.07)", color: cream, border: "1px solid rgba(255,255,255,.16)" }}>
                      Edit
                    </button>

                    <button onClick={() => toggleProduct(product)} style={{ ...buttonStyle, background: "transparent", color: gold, border: "1px solid rgba(215,178,122,.35)" }}>
                      {product.active ? "Hide" : "Show"}
                    </button>

                    <button onClick={() => deleteProduct(product)} style={{ ...buttonStyle, background: "rgba(255,0,0,.12)", color: "#ffb3b3", border: "1px solid rgba(255,90,90,.35)" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CustomPerfumeAdminPanel />
      <CarFragranceAdminPanel />
      <AdminOrdersPanel />
    </main>
  );
}