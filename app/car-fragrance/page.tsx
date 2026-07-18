"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../components/CartContext";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  base_price: number;
  image_url: string | null;
  description: string | null;
};

type Scent = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
};

type Size = {
  id: string;
  label: string;
  volume_ml: number;
  price: number;
};

type Intensity = {
  id: string;
  name: string;
  multiplier: number;
  description: string | null;
};

type Settings = {
  packaging_cost: number;
  personalization_price: number;
  profit_markup_percent: number;
};

const fallbackSettings: Settings = {
  packaging_cost: 0,
  personalization_price: 0,
  profit_markup_percent: 0,
};

export default function CarFragrancePage() {
  const { addItem, openCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [scents, setScents] = useState<Scent[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [intensities, setIntensities] = useState<Intensity[]>([]);
  const [settings, setSettings] = useState<Settings>(fallbackSettings);

  const [productId, setProductId] = useState("");
  const [scentId, setScentId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [intensityId, setIntensityId] = useState("");
  const [labelName, setLabelName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);

      const [p, s, z, i, st] = await Promise.all([
        supabase.from("car_fragrance_products").select("*").eq("active", true).order("created_at"),
        supabase.from("car_fragrance_scents").select("*").eq("active", true).order("created_at"),
        supabase.from("car_fragrance_sizes").select("*").eq("active", true).order("volume_ml"),
        supabase.from("car_fragrance_intensities").select("*").eq("active", true).order("multiplier"),
        supabase.from("car_fragrance_settings").select("*").limit(1).maybeSingle(),
      ]);

      const firstError = p.error || s.error || z.error || i.error || st.error;
      if (firstError) setError(firstError.message);

      const productData = (p.data || []) as Product[];
      const scentData = (s.data || []) as Scent[];
      const sizeData = (z.data || []) as Size[];
      const intensityData = (i.data || []) as Intensity[];

      setProducts(productData);
      setScents(scentData);
      setSizes(sizeData);
      setIntensities(intensityData);
      if (st.data) setSettings(st.data as Settings);

      setProductId(productData[0]?.id || "");
      setScentId(scentData[0]?.id || "");
      setSizeId(sizeData[0]?.id || "");
      setIntensityId(intensityData[0]?.id || "");
      setLoading(false);
    })();
  }, []);

  const product = products.find((item) => item.id === productId);
  const scent = scents.find((item) => item.id === scentId);
  const size = sizes.find((item) => item.id === sizeId);
  const intensity = intensities.find((item) => item.id === intensityId);

  const unitPrice = useMemo(() => {
    if (!product || !scent || !size || !intensity) return 0;

    const subtotal =
      (product.base_price + scent.price + size.price) * intensity.multiplier +
      settings.packaging_cost +
      (labelName.trim() ? settings.personalization_price : 0);

    return Number(
      (subtotal * (1 + settings.profit_markup_percent / 100)).toFixed(2)
    );
  }, [product, scent, size, intensity, settings, labelName]);

  const totalPrice = Number((unitPrice * quantity).toFixed(2));
  const previewImage = product?.image_url || scent?.image_url || null;
  const ready = Boolean(product && scent && size && intensity);

  function addToCart() {
    if (!product || !scent || !size || !intensity) return;

    addItem({
      id: `car-fragrance-${Date.now()}`,
      name: [
        product.name,
        scent.name,
        size.label,
        intensity.name,
        labelName.trim() || null,
        `Qty ${quantity}`,
      ]
        .filter(Boolean)
        .join(" · "),
      price: totalPrice,
      image: previewImage || "/images/logo.png",
    });

    openCart();
  }

  if (loading) {
    return (
      <main className="cf-page">
        <div className="cf-shell"><p>Loading LA VIE Car Fragrance...</p></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="cf-page">
        <div className="cf-shell">
          <Link href="/" className="cf-back">← Back to LA VIE</Link>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="cf-page">
      <style jsx global>{`
        .cf-page{min-height:100vh;background:radial-gradient(circle at 18% 8%,rgba(215,178,122,.12),transparent 31%),linear-gradient(135deg,#080808,#101010 55%,#070707);color:#f5f0e8;padding:34px 20px 130px}
        .cf-shell{width:min(1420px,100%);margin:0 auto}
        .cf-back{display:inline-block;color:#d7b27a;text-decoration:none;font-weight:700;margin-bottom:34px}
        .cf-header{max-width:850px;margin-bottom:42px}
        .cf-eyebrow{color:#d7b27a;letter-spacing:4px;font-size:12px;font-weight:800;margin:0 0 14px}
        .cf-header h1{font-family:Georgia,serif;font-size:clamp(48px,7vw,92px);font-weight:400;line-height:.96;margin:0 0 20px}
        .cf-header p:last-child{max-width:720px;color:rgba(245,240,232,.72);font-size:17px;line-height:1.7}
        .cf-grid{display:grid;grid-template-columns:minmax(360px,.9fr) minmax(520px,1.2fr);gap:28px;align-items:start}
        .cf-preview{position:sticky;top:24px;border:1px solid rgba(215,178,122,.28);border-radius:28px;padding:28px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.012));overflow:hidden}
        .cf-glow{position:absolute;inset:12% 12% auto;height:260px;background:radial-gradient(circle,rgba(215,178,122,.24),transparent 68%);filter:blur(24px)}
        .cf-image-wrap{position:relative;z-index:2;min-height:440px;display:grid;place-items:center}
        .cf-image{width:84%;max-height:420px;object-fit:contain;filter:drop-shadow(0 30px 34px rgba(0,0,0,.58));transition:.35s ease}
        .cf-fallback{width:245px;height:360px;border:1px solid rgba(215,178,122,.5);border-radius:28px;background:linear-gradient(155deg,#1d1d1d,#050505);display:grid;place-items:center;box-shadow:0 28px 80px rgba(0,0,0,.56)}
        .cf-fallback strong{display:block;text-align:center;letter-spacing:5px}
        .cf-fallback small{display:block;text-align:center;color:#d7b27a;margin-top:10px;letter-spacing:2px}
        .cf-summary{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
        .cf-summary div{border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;background:rgba(255,255,255,.025)}
        .cf-summary span{display:block;color:rgba(245,240,232,.52);font-size:12px;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:5px}
        .cf-summary strong{font-size:15px}
        .cf-summary .cf-price-box{grid-column:1/-1;border-color:rgba(215,178,122,.32)}
        .cf-summary .cf-price-box strong{font-size:30px;color:#d7b27a}
        .cf-config{border:1px solid rgba(215,178,122,.22);border-radius:28px;padding:28px;background:rgba(255,255,255,.018)}
        .cf-step{padding:0 0 30px;margin-bottom:30px;border-bottom:1px solid rgba(255,255,255,.08)}
        .cf-step:last-of-type{border-bottom:0}
        .cf-step-title{display:flex;align-items:center;gap:12px;margin-bottom:18px}
        .cf-step-title span{width:34px;height:34px;border:1px solid rgba(215,178,122,.4);border-radius:50%;display:grid;place-items:center;color:#d7b27a;font-size:12px}
        .cf-step-title h2{font-family:Georgia,serif;font-weight:400;font-size:27px;margin:0}
        .cf-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .cf-choices.three{grid-template-columns:repeat(3,minmax(0,1fr))}
        .cf-choice{appearance:none;text-align:left;padding:18px;border-radius:18px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.025);color:#f5f0e8;cursor:pointer;transition:.22s ease;min-height:100px}
        .cf-choice:hover{transform:translateY(-2px);border-color:rgba(215,178,122,.42);background:rgba(215,178,122,.055)}
        .cf-choice.is-selected{border-color:#d7b27a;background:linear-gradient(180deg,rgba(215,178,122,.15),rgba(215,178,122,.045));box-shadow:0 0 0 1px rgba(215,178,122,.15),0 14px 34px rgba(0,0,0,.25)}
        .cf-choice strong{display:block;font-size:16px;margin-bottom:7px}
        .cf-choice small{color:rgba(245,240,232,.62);line-height:1.45}
        .cf-input{width:100%;padding:15px 16px;border-radius:14px;border:1px solid rgba(215,178,122,.28);background:rgba(255,255,255,.035);color:#f5f0e8;outline:none}
        .cf-quantity{width:150px}
        .cf-empty{border:1px solid rgba(215,178,122,.25);border-radius:20px;padding:24px;color:rgba(245,240,232,.7)}
        .cf-sticky-bar{position:fixed;left:0;right:0;bottom:0;z-index:50;background:rgba(7,7,7,.92);backdrop-filter:blur(18px);border-top:1px solid rgba(215,178,122,.25);padding:14px 20px}
        .cf-sticky-inner{width:min(1420px,100%);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:20px}
        .cf-total-label{color:rgba(245,240,232,.58);font-size:12px;letter-spacing:1.5px;text-transform:uppercase}
        .cf-total-value{display:block;font-family:Georgia,serif;font-size:32px;color:#d7b27a;margin-top:2px}
        .cf-add{border:0;border-radius:999px;padding:16px 28px;font-weight:900;cursor:pointer;background:linear-gradient(90deg,#f4d49c,#b8873b);color:#111;min-width:260px}
        .cf-add:disabled{opacity:.45;cursor:not-allowed}
        @media(max-width:980px){.cf-grid{grid-template-columns:1fr}.cf-preview{position:relative;top:auto}.cf-image-wrap{min-height:360px}}
        @media(max-width:640px){.cf-page{padding:24px 14px 120px}.cf-header h1{font-size:52px}.cf-config,.cf-preview{padding:20px;border-radius:22px}.cf-choices,.cf-choices.three{grid-template-columns:1fr}.cf-summary{grid-template-columns:1fr 1fr}.cf-sticky-inner{gap:12px}.cf-add{min-width:0;padding:14px 18px}.cf-total-value{font-size:26px}}
      `}</style>

      <div className="cf-shell">
        <Link href="/" className="cf-back">← Back to LA VIE</Link>

        <header className="cf-header">
          <p className="cf-eyebrow">LA VIE AUTOMOTIVE FRAGRANCE</p>
          <h1>Car Fragrance</h1>
          <p>
            A refined scent experience designed for elegant interiors.
            Select the format, fragrance, size and intensity that suit your car.
          </p>
        </header>

        {!ready ? (
          <div className="cf-empty">
            Activate at least one car product, scent, size and intensity in the admin page.
          </div>
        ) : (
          <div className="cf-grid">
            <section className="cf-preview">
              <div className="cf-glow" />
              <div className="cf-image-wrap">
                {previewImage ? (
                  <img className="cf-image" src={previewImage} alt={product?.name || "Car fragrance"} />
                ) : (
                  <div className="cf-fallback">
                    <div>
                      <strong>LA VIE</strong>
                      <small>CAR FRAGRANCE</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="cf-summary">
                <Summary label="Product" value={product?.name || "—"} />
                <Summary label="Scent" value={scent?.name || "—"} />
                <Summary label="Size" value={size?.label || "—"} />
                <Summary label="Intensity" value={intensity?.name || "—"} />
                <Summary label="Quantity" value={String(quantity)} />
                <Summary label="Personalisation" value={labelName.trim() || "None"} />
                <div className="cf-price-box">
                  <span>Total price</span>
                  <strong>€{totalPrice.toFixed(2)}</strong>
                </div>
              </div>
            </section>

            <section className="cf-config">
              <Step number="01" title="Choose the product">
                <div className="cf-choices">
                  {products.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`cf-choice ${productId === item.id ? "is-selected" : ""}`}
                      onClick={() => setProductId(item.id)}
                    >
                      <strong>{item.name}</strong>
                      <small>{item.description || `From €${item.base_price.toFixed(2)}`}</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step number="02" title="Choose the scent">
                <div className="cf-choices">
                  {scents.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`cf-choice ${scentId === item.id ? "is-selected" : ""}`}
                      onClick={() => setScentId(item.id)}
                    >
                      <strong>{item.name}</strong>
                      <small>{item.description || (item.price ? `+€${item.price.toFixed(2)}` : "Included")}</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step number="03" title="Choose the size">
                <div className="cf-choices three">
                  {sizes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`cf-choice ${sizeId === item.id ? "is-selected" : ""}`}
                      onClick={() => setSizeId(item.id)}
                    >
                      <strong>{item.label}</strong>
                      <small>{item.price ? `+€${item.price.toFixed(2)}` : "Included"}</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step number="04" title="Choose the fragrance intensity">
                <div className="cf-choices">
                  {intensities.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`cf-choice ${intensityId === item.id ? "is-selected" : ""}`}
                      onClick={() => setIntensityId(item.id)}
                    >
                      <strong>{item.name}</strong>
                      <small>{item.description || `${item.multiplier.toFixed(2)}×`}</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step number="05" title="Personalise the label">
                <input
                  className="cf-input"
                  value={labelName}
                  onChange={(event) => setLabelName(event.target.value.slice(0, 24))}
                  placeholder="Name or short message (optional)"
                />
              </Step>

              <Step number="06" title="Quantity">
                <input
                  className="cf-input cf-quantity"
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.max(1, Math.min(20, Number(event.target.value) || 1)))
                  }
                />
              </Step>
            </section>
          </div>
        )}
      </div>

      <div className="cf-sticky-bar">
        <div className="cf-sticky-inner">
          <div>
            <span className="cf-total-label">Total price</span>
            <strong className="cf-total-value">€{totalPrice.toFixed(2)}</strong>
          </div>
          <button className="cf-add" type="button" disabled={!ready} onClick={addToCart}>
            Add Car Fragrance to Cart
          </button>
        </div>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cf-step">
      <div className="cf-step-title">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
