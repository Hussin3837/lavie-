"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCart } from "../../components/CartContext";
import { supabase } from "../../lib/supabase";

type ProductType = {
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

type Strength = {
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

export default function HomeFragrancePage() {
  const { addItem, openCart } = useCart();
  const [types, setTypes] = useState<ProductType[]>([]);
  const [scents, setScents] = useState<Scent[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [strengths, setStrengths] = useState<Strength[]>([]);
  const [settings, setSettings] = useState<Settings>(fallbackSettings);
  const [typeId, setTypeId] = useState("");
  const [scentId, setScentId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [strengthId, setStrengthId] = useState("");
  const [labelName, setLabelName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const [t, s, z, g, st] = await Promise.all([
        supabase.from("home_fragrance_types").select("*").eq("active", true).order("created_at"),
        supabase.from("home_fragrance_scents").select("*").eq("active", true).order("created_at"),
        supabase.from("home_fragrance_sizes").select("*").eq("active", true).order("volume_ml"),
        supabase.from("home_fragrance_strengths").select("*").eq("active", true).order("multiplier"),
        supabase.from("home_fragrance_settings").select("*").limit(1).maybeSingle(),
      ]);

      const firstError = t.error || s.error || z.error || g.error || st.error;
      if (firstError) setError(firstError.message);

      const typeData = (t.data || []) as ProductType[];
      const scentData = (s.data || []) as Scent[];
      const sizeData = (z.data || []) as Size[];
      const strengthData = (g.data || []) as Strength[];

      setTypes(typeData);
      setScents(scentData);
      setSizes(sizeData);
      setStrengths(strengthData);
      if (st.data) setSettings(st.data as Settings);

      setTypeId(typeData[0]?.id || "");
      setScentId(scentData[0]?.id || "");
      setSizeId(sizeData[0]?.id || "");
      setStrengthId(strengthData[0]?.id || "");
      setLoading(false);
    })();
  }, []);

  const type = types.find((item) => item.id === typeId);
  const scent = scents.find((item) => item.id === scentId);
  const size = sizes.find((item) => item.id === sizeId);
  const strength = strengths.find((item) => item.id === strengthId);

  const unitPrice = useMemo(() => {
    if (!type || !scent || !size || !strength) return 0;

    const base =
      (type.base_price + size.price + scent.price) * strength.multiplier +
      settings.packaging_cost +
      (labelName.trim() ? settings.personalization_price : 0);

    return Number((base * (1 + settings.profit_markup_percent / 100)).toFixed(2));
  }, [type, scent, size, strength, settings, labelName]);

  const totalPrice = Number((unitPrice * quantity).toFixed(2));
  const previewImage = type?.image_url || scent?.image_url || null;

  function addToCart() {
    if (!type || !scent || !size || !strength) return;

    addItem({
      id: `home-fragrance-${Date.now()}`,
      name: [type.name, scent.name, size.label, strength.name, labelName.trim() || null]
        .filter(Boolean)
        .join(" · "),
      price: totalPrice,
      image: previewImage || "/images/logo.png",
    });

    openCart();
  }

  if (loading) {
    return (
      <main className="hf-page">
        <div className="hf-shell"><p>Loading LA VIE Home...</p></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="hf-page">
        <div className="hf-shell">
          <Link href="/" className="hf-back">← Back to LA VIE</Link>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="hf-page">
      <style jsx global>{`
        .hf-page{min-height:100vh;background:radial-gradient(circle at 20% 10%,rgba(215,178,122,.10),transparent 30%),#070707;color:#f5f0e8;padding:34px 20px 130px}.hf-shell{width:min(1420px,100%);margin:0 auto}.hf-back{display:inline-block;color:#d7b27a;text-decoration:none;font-weight:700;margin-bottom:34px}.hf-header{max-width:820px;margin-bottom:42px}.hf-eyebrow{color:#d7b27a;letter-spacing:4px;font-size:12px;font-weight:800;margin:0 0 14px}.hf-header h1{font-family:Georgia,serif;font-size:clamp(48px,7vw,92px);font-weight:400;line-height:.96;margin:0 0 20px}.hf-header p:last-child{max-width:700px;color:rgba(245,240,232,.72);font-size:17px;line-height:1.7}.hf-grid{display:grid;grid-template-columns:minmax(360px,.9fr) minmax(520px,1.2fr);gap:28px;align-items:start}.hf-preview{position:sticky;top:24px;border:1px solid rgba(215,178,122,.28);border-radius:28px;padding:28px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012));overflow:hidden}.hf-glow{position:absolute;inset:12% 16% auto;height:250px;background:radial-gradient(circle,rgba(215,178,122,.22),transparent 68%);filter:blur(20px)}.hf-image-wrap{position:relative;z-index:2;min-height:440px;display:grid;place-items:center}.hf-image{width:82%;max-height:420px;object-fit:contain;filter:drop-shadow(0 28px 30px rgba(0,0,0,.55))}.hf-fallback{width:240px;height:390px;border:1px solid rgba(215,178,122,.5);border-radius:24px;background:linear-gradient(160deg,#181818,#050505);display:grid;place-items:center;box-shadow:0 24px 80px rgba(0,0,0,.5)}.hf-fallback strong{display:block;text-align:center;letter-spacing:5px}.hf-fallback small{display:block;text-align:center;color:#d7b27a;margin-top:10px;letter-spacing:2px}.hf-summary{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}.hf-summary div{border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;background:rgba(255,255,255,.025)}.hf-summary span{display:block;color:rgba(245,240,232,.52);font-size:12px;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:5px}.hf-summary strong{font-size:15px}.hf-summary .hf-price-box{grid-column:1/-1;border-color:rgba(215,178,122,.32)}.hf-summary .hf-price-box strong{font-size:30px;color:#d7b27a}.hf-config{border:1px solid rgba(215,178,122,.22);border-radius:28px;padding:28px;background:rgba(255,255,255,.018)}.hf-step{padding:0 0 30px;margin-bottom:30px;border-bottom:1px solid rgba(255,255,255,.08)}.hf-step:last-of-type{border-bottom:0}.hf-step-title{display:flex;align-items:center;gap:12px;margin-bottom:18px}.hf-step-title span{width:34px;height:34px;border:1px solid rgba(215,178,122,.4);border-radius:50%;display:grid;place-items:center;color:#d7b27a;font-size:12px}.hf-step-title h2{font-family:Georgia,serif;font-weight:400;font-size:27px;margin:0}.hf-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.hf-choices.three{grid-template-columns:repeat(3,minmax(0,1fr))}.hf-choice{appearance:none;text-align:left;padding:18px;border-radius:18px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.025);color:#f5f0e8;cursor:pointer;transition:.22s ease;min-height:100px}.hf-choice:hover{transform:translateY(-2px);border-color:rgba(215,178,122,.42);background:rgba(215,178,122,.055)}.hf-choice.is-selected{border-color:#d7b27a;background:linear-gradient(180deg,rgba(215,178,122,.15),rgba(215,178,122,.045));box-shadow:0 0 0 1px rgba(215,178,122,.15),0 14px 34px rgba(0,0,0,.25)}.hf-choice strong{display:block;font-size:16px;margin-bottom:7px}.hf-choice small{color:rgba(245,240,232,.62);line-height:1.45}.hf-input{width:100%;padding:15px 16px;border-radius:14px;border:1px solid rgba(215,178,122,.28);background:rgba(255,255,255,.035);color:#f5f0e8;outline:none}.hf-quantity{width:150px}.hf-empty{border:1px solid rgba(215,178,122,.25);border-radius:20px;padding:24px;color:rgba(245,240,232,.7)}.hf-sticky-bar{position:fixed;left:0;right:0;bottom:0;z-index:50;background:rgba(7,7,7,.92);backdrop-filter:blur(18px);border-top:1px solid rgba(215,178,122,.25);padding:14px 20px}.hf-sticky-inner{width:min(1420px,100%);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:20px}.hf-total-label{color:rgba(245,240,232,.58);font-size:12px;letter-spacing:1.5px;text-transform:uppercase}.hf-total-value{display:block;font-family:Georgia,serif;font-size:32px;color:#d7b27a;margin-top:2px}.hf-add{border:0;border-radius:999px;padding:16px 28px;font-weight:900;cursor:pointer;background:linear-gradient(90deg,#f4d49c,#b8873b);color:#111;min-width:260px}.hf-add:disabled{opacity:.45;cursor:not-allowed}@media(max-width:980px){.hf-grid{grid-template-columns:1fr}.hf-preview{position:relative;top:auto}.hf-image-wrap{min-height:360px}}@media(max-width:640px){.hf-page{padding:24px 14px 120px}.hf-header h1{font-size:52px}.hf-config,.hf-preview{padding:20px;border-radius:22px}.hf-choices,.hf-choices.three{grid-template-columns:1fr}.hf-summary{grid-template-columns:1fr 1fr}.hf-sticky-inner{gap:12px}.hf-add{min-width:0;padding:14px 18px}.hf-total-value{font-size:26px}}
      `}</style>

      <div className="hf-shell">
        <Link href="/" className="hf-back">← Back to LA VIE</Link>

        <header className="hf-header">
          <p className="hf-eyebrow">LA VIE HOME FRAGRANCE</p>
          <h1>Home Fragrance</h1>
          <p>Luxury fragrances crafted for your home, car and fabrics. Choose your scent and create a refined atmosphere.</p>
        </header>

        {!type || !scent || !size || !strength ? (
          <div className="hf-empty">Please activate at least one product, scent, size and strength in the admin page.</div>
        ) : (
          <div className="hf-grid">
            <section className="hf-preview">
              <div className="hf-glow" />
              <div className="hf-image-wrap">
                {previewImage ? (
                  <img className="hf-image" src={previewImage} alt={type.name} />
                ) : (
                  <div className="hf-fallback">
                    <div>
                      <strong>LA VIE</strong>
                      <small>{labelName || scent.name}</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="hf-summary">
                <Summary label="Product" value={type.name} />
                <Summary label="Scent" value={scent.name} />
                <Summary label="Size" value={size.label} />
                <Summary label="Strength" value={strength.name} />
                <Summary label="Quantity" value={String(quantity)} />
                <Summary label="Label" value={labelName.trim() || "LA VIE HOME"} />
                <div className="hf-price-box"><span>Total price</span><strong>€{totalPrice.toFixed(2)}</strong></div>
              </div>
            </section>

            <section className="hf-config">
              <Step n="01" title="Choose the product">
                <div className="hf-choices three">
                  {types.map((item) => (
                    <button key={item.id} type="button" className={`hf-choice ${typeId === item.id ? "is-selected" : ""}`} onClick={() => setTypeId(item.id)}>
                      <strong>{item.name}</strong>
                      <small>{item.description || `From €${item.base_price.toFixed(2)}`}</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step n="02" title="Choose the scent">
                <div className="hf-choices">
                  {scents.map((item) => (
                    <button key={item.id} type="button" className={`hf-choice ${scentId === item.id ? "is-selected" : ""}`} onClick={() => setScentId(item.id)}>
                      <strong>{item.name}</strong>
                      <small>{item.description || `+€${item.price.toFixed(2)}`}</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step n="03" title="Choose the size">
                <div className="hf-choices three">
                  {sizes.map((item) => (
                    <button key={item.id} type="button" className={`hf-choice ${sizeId === item.id ? "is-selected" : ""}`} onClick={() => setSizeId(item.id)}>
                      <strong>{item.label}</strong>
                      <small>{item.volume_ml} ml</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step n="04" title="Choose the fragrance strength">
                <div className="hf-choices">
                  {strengths.map((item) => (
                    <button key={item.id} type="button" className={`hf-choice ${strengthId === item.id ? "is-selected" : ""}`} onClick={() => setStrengthId(item.id)}>
                      <strong>{item.name}</strong>
                      <small>{item.description || `${item.multiplier.toFixed(2)}×`}</small>
                    </button>
                  ))}
                </div>
              </Step>

              <Step n="05" title="Personalise the label">
                <input className="hf-input" value={labelName} onChange={(event) => setLabelName(event.target.value.slice(0, 24))} placeholder="Your name (optional)" />
              </Step>

              <Step n="06" title="Quantity">
                <input className="hf-input hf-quantity" type="number" min={1} max={20} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(20, Number(event.target.value) || 1)))} />
              </Step>
            </section>
          </div>
        )}
      </div>

      <div className="hf-sticky-bar">
        <div className="hf-sticky-inner">
          <div><span className="hf-total-label">Total price</span><strong className="hf-total-value">€{totalPrice.toFixed(2)}</strong></div>
          <button className="hf-add" onClick={addToCart} disabled={!type || !scent || !size || !strength}>Add to Cart</button>
        </div>
      </div>
    </main>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return <div className="hf-step"><div className="hf-step-title"><span>{n}</span><h2>{title}</h2></div>{children}</div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
