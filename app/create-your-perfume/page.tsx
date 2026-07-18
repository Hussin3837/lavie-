"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../components/CartContext";
import { supabase } from "../../lib/supabase";

type Bottle = {
  id: string;
  name: string;
  capacity_ml: number;
  price: number;
  image_url: string | null;
  description: string | null;
};

type Oil = {
  id: string;
  name: string;
  price_per_unit: number;
  unit: "ml" | "g";
  image_url: string | null;
  description: string | null;
};

type Amount = { id: string; amount: number; unit: "ml" | "g" };
type Personalisation = { id: string; price: number };
type Settings = {
  alcohol_price_per_ml: number;
  packaging_cost: number;
  profit_markup_percent: number;
  default_bottle_capacity_ml: number;
};

const fallbackSettings: Settings = {
  alcohol_price_per_ml: 0,
  packaging_cost: 0,
  profit_markup_percent: 0,
  default_bottle_capacity_ml: 50,
};

const money = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);

export default function CreateYourPerfumePage() {
  const { addItem, openCart } = useCart();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [oils, setOils] = useState<Oil[]>([]);
  const [amounts, setAmounts] = useState<Amount[]>([]);
  const [personalisation, setPersonalisation] = useState<Personalisation | null>(null);
  const [settings, setSettings] = useState<Settings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bottleId, setBottleId] = useState("");
  const [oilId, setOilId] = useState("");
  const [amountId, setAmountId] = useState("");
  const [personalName, setPersonalName] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError("");

      const [bottleResult, oilResult, amountResult, personalisationResult, settingsResult] =
        await Promise.all([
          supabase.from("custom_bottles").select("*").eq("active", true).order("created_at"),
          supabase.from("fragrance_oils").select("*").eq("active", true).order("created_at"),
          supabase.from("oil_amount_options").select("*").eq("active", true).order("amount"),
          supabase
            .from("custom_perfume_addons")
            .select("id,price")
            .eq("active", true)
            .eq("category", "personalization")
            .limit(1)
            .maybeSingle(),
          supabase.from("custom_perfume_settings").select("*").limit(1).maybeSingle(),
        ]);

      const firstError =
        bottleResult.error ||
        oilResult.error ||
        amountResult.error ||
        personalisationResult.error ||
        settingsResult.error;

      if (firstError) setError(firstError.message);

      const loadedBottles = (bottleResult.data || []) as Bottle[];
      const loadedOils = (oilResult.data || []) as Oil[];
      const loadedAmounts = (amountResult.data || []) as Amount[];

      setBottles(loadedBottles);
      setOils(loadedOils);
      setAmounts(loadedAmounts);
      setPersonalisation((personalisationResult.data as Personalisation | null) || null);
      if (settingsResult.data) setSettings(settingsResult.data as Settings);

      setBottleId(loadedBottles[0]?.id || "");
      setOilId(loadedOils[0]?.id || "");
      setAmountId(loadedAmounts[0]?.id || "");
      setLoading(false);
    })();
  }, []);

  const bottle = bottles.find((item) => item.id === bottleId);
  const oil = oils.find((item) => item.id === oilId);

  const validAmounts = useMemo(
    () => amounts.filter((item) => !oil || item.unit === oil.unit),
    [amounts, oil],
  );

  const amount = validAmounts.find((item) => item.id === amountId) || validAmounts[0];

  useEffect(() => {
    if (validAmounts.length && !validAmounts.some((item) => item.id === amountId)) {
      setAmountId(validAmounts[0].id);
    }
  }, [validAmounts, amountId]);

  const breakdown = useMemo(() => {
    if (!bottle || !oil || !amount) {
      return { oilCost: 0, alcoholMl: 0, alcoholCost: 0, personalisationCost: 0, total: 0 };
    }

    const oilCost = amount.amount * oil.price_per_unit;
    const alcoholMl = Math.max(0, bottle.capacity_ml - amount.amount);
    const alcoholCost = alcoholMl * settings.alcohol_price_per_ml;
    const personalisationCost = personalName.trim() ? personalisation?.price || 0 : 0;
    const subtotal = bottle.price + oilCost + alcoholCost + settings.packaging_cost + personalisationCost;
    const total = subtotal + subtotal * (settings.profit_markup_percent / 100);

    return {
      oilCost,
      alcoholMl,
      alcoholCost,
      personalisationCost,
      total: Number(total.toFixed(2)),
    };
  }, [bottle, oil, amount, settings, personalName, personalisation]);

  const concentration =
    amount && bottle ? Math.round((amount.amount / bottle.capacity_ml) * 100) : 0;

  function addCustomPerfume() {
    if (!bottle || !oil || !amount) return;

    addItem({
      id: `custom-perfume-${Date.now()}`,
      name: [
        "Custom LA VIE",
        oil.name,
        `${amount.amount}${amount.unit}`,
        personalName.trim() || null,
      ]
        .filter(Boolean)
        .join(" · "),
      price: breakdown.total,
      image: bottle.image_url || oil.image_url || "/images/logo.png",
    });

    openCart();
  }

  if (loading) {
    return (
      <main className="atelier-page atelier-center">
        <div className="atelier-loader" />
        <p>Preparing the LA VIE Atelier...</p>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main className="atelier-page">
        <div className="atelier-shell">
          <Link href="/" className="atelier-back">← Back to LA VIE</Link>
          <div className="atelier-message error"><strong>Unable to open the atelier.</strong><span>{error}</span></div>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  const ready = Boolean(bottle && oil && amount);

  return (
    <main className="atelier-page">
      <div className="atelier-orb orb-one" />
      <div className="atelier-orb orb-two" />

      <div className="atelier-shell">
        <Link href="/" className="atelier-back">← Back to LA VIE</Link>

        <section className="atelier-intro">
          <div className="atelier-promises">
            <span>THE LA VIE ATELIER</span>
            <span>HANDCRAFTED IN GERMANY</span>
            <span>BLENDED AFTER YOUR ORDER</span>
          </div>

          <p className="atelier-eyebrow">A PRIVATE FRAGRANCE EXPERIENCE</p>
          <h1>Create Your Own<br />Perfume</h1>
          <p className="atelier-lead">
            Select your bottle, fragrance and concentration. Personalise the label and watch your creation come to life.
          </p>
        </section>

        {!bottles.length || !oils.length || !amounts.length ? (
          <div className="atelier-message">
            <strong>The atelier is being prepared</strong>
            <span>Please activate at least one bottle, fragrance oil and oil amount in the admin page.</span>
          </div>
        ) : (
          <section className="atelier-builder">
            <aside className="atelier-preview">
              <div className="preview-sticky">
                <div className="preview-stage">
                  <div className="preview-halo" />
                  <div className="preview-floor" />

                  {bottle?.image_url ? (
                    <img className="preview-image" src={bottle.image_url} alt={bottle.name} />
                  ) : (
                    <div className="fallback-bottle">
                      <div className="fallback-cap" />
                      <div className="fallback-glass">
                        <span>LA VIE</span>
                        <small>{personalName || oil?.name || "YOUR PERFUME"}</small>
                      </div>
                    </div>
                  )}

                  <div className="live-label">
                    <span>LA VIE</span>
                    <strong>{personalName.trim() || oil?.name || "YOUR PERFUME"}</strong>
                    <small>{bottle?.capacity_ml || 50} ML · EAU DE PARFUM</small>
                  </div>
                </div>

                <div className="preview-details">
                  <Detail label="Bottle" value={bottle?.name || "—"} />
                  <Detail label="Fragrance" value={oil?.name || "—"} />
                  <Detail label="Concentration" value={`${concentration}%`} />
                  <Detail label="Final volume" value={`${bottle?.capacity_ml || 0} ml`} />
                </div>

                <div className="preview-price">
                  <span>Your creation</span>
                  <strong>{money(breakdown.total)}</strong>
                </div>
              </div>
            </aside>

            <div className="atelier-options">
              <ChoiceSection number="01" title="Choose your bottle" subtitle="The foundation of your creation">
                <div className="choice-grid">
                  {bottles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`choice-card ${bottleId === item.id ? "selected" : ""}`}
                      onClick={() => setBottleId(item.id)}
                    >
                      <span className="choice-check">✓</span>
                      <strong>{item.name}</strong>
                      <small>{item.capacity_ml} ml</small>
                      <em>{money(item.price)}</em>
                    </button>
                  ))}
                </div>
              </ChoiceSection>

              <ChoiceSection number="02" title="Choose your fragrance" subtitle="Select the soul of your perfume">
                <div className="choice-grid oils">
                  {oils.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`choice-card fragrance ${oilId === item.id ? "selected" : ""}`}
                      onClick={() => setOilId(item.id)}
                    >
                      <span className="choice-check">✓</span>
                      <strong>{item.name}</strong>
                      <small>{item.description || "A signature LA VIE composition"}</small>
                      <em>{money(item.price_per_unit)} / {item.unit}</em>
                    </button>
                  ))}
                </div>
              </ChoiceSection>

              <ChoiceSection number="03" title="Oil concentration" subtitle="Choose the intensity and character">
                <div className="amount-grid">
                  {validAmounts.map((item) => {
                    const percent = bottle ? Math.round((item.amount / bottle.capacity_ml) * 100) : 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`amount-card ${amount?.id === item.id ? "selected" : ""}`}
                        onClick={() => setAmountId(item.id)}
                      >
                        <strong>{item.amount} {item.unit}</strong>
                        <span>{percent}% concentration</span>
                      </button>
                    );
                  })}
                </div>
              </ChoiceSection>

              <ChoiceSection number="04" title="Personalise the label" subtitle="Make this creation unmistakably yours">
                <div className="name-field">
                  <input
                    value={personalName}
                    onChange={(event) => setPersonalName(event.target.value.slice(0, 24))}
                    placeholder="Your name or perfume name"
                  />
                  <span>{personalName.length}/24</span>
                </div>
                <p className="field-note">Your text appears on the bottle preview instantly.</p>
              </ChoiceSection>

              <section className="order-review">
                <div>
                  <p>YOUR CUSTOM PERFUME</p>
                  <h2>{oil?.name || "LA VIE Creation"}</h2>
                  <span>{bottle?.name} · {amount?.amount}{amount?.unit} oil · {concentration}% concentration</span>
                </div>

                <div className="review-price">
                  <small>Final price</small>
                  <strong>{money(breakdown.total)}</strong>
                </div>

                <button type="button" className="add-button" onClick={addCustomPerfume} disabled={!ready}>
                  <span>Add Custom Perfume to Cart</span>
                  <b>→</b>
                </button>

                <div className="price-note">
                  <span>Bottle {money(Number(bottle?.price || 0))}</span>
                  <span>Oil {money(breakdown.oilCost)}</span>
                  <span>Packaging {money(settings.packaging_cost)}</span>
                </div>
              </section>

              <Link href="/home-fragrance" className="home-fragrance-link">
                Continue to Create Your Home Fragrance <span>→</span>
              </Link>
            </div>
          </section>
        )}
      </div>

      <style jsx>{styles}</style>
    </main>
  );
}

function ChoiceSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="choice-section">
      <header>
        <span>{number}</span>
        <div><h2>{title}</h2><p>{subtitle}</p></div>
      </header>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

const styles = `
  .atelier-page{position:relative;min-height:100vh;overflow:hidden;background:radial-gradient(circle at 18% 14%,rgba(111,80,37,.18),transparent 34%),radial-gradient(circle at 85% 55%,rgba(215,178,122,.08),transparent 30%),#070707;color:#f5f0e8;padding:28px 0 90px;font-family:var(--font-body),Arial,sans-serif}
  .atelier-shell{position:relative;z-index:2;width:min(1380px,calc(100% - 42px));margin:0 auto}
  .atelier-back{display:inline-flex;color:#d7b27a;text-decoration:none;font-size:14px;font-weight:700;margin-bottom:28px}
  .atelier-intro{max-width:900px;margin-bottom:44px}
  .atelier-promises{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:38px}
  .atelier-promises span{border:1px solid rgba(215,178,122,.28);padding:12px 14px;text-align:center;font-size:10px;letter-spacing:1.8px;background:rgba(255,255,255,.018)}
  .atelier-eyebrow{color:#d7b27a;font-size:11px;font-weight:800;letter-spacing:4px;margin:0 0 14px}
  .atelier-intro h1{font-family:var(--font-heading),Georgia,serif;font-size:clamp(58px,8vw,112px);line-height:.88;font-weight:400;letter-spacing:-4px;margin:0;max-width:920px}
  .atelier-lead{max-width:680px;font-size:17px;line-height:1.75;color:rgba(245,240,232,.66);margin:26px 0 0}
  .atelier-builder{display:grid;grid-template-columns:minmax(360px,.82fr) minmax(580px,1.18fr);gap:26px;align-items:start}
  .atelier-preview,.atelier-options{min-width:0}
  .preview-sticky{position:sticky;top:22px;border:1px solid rgba(215,178,122,.22);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.012));padding:24px;box-shadow:0 40px 100px rgba(0,0,0,.34);backdrop-filter:blur(18px)}
  .preview-stage{position:relative;height:560px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:22px;background:radial-gradient(circle at 50% 38%,rgba(215,178,122,.13),transparent 44%),linear-gradient(180deg,#111,#090909)}
  .preview-halo{position:absolute;width:380px;height:380px;border-radius:50%;border:1px solid rgba(215,178,122,.18);box-shadow:0 0 90px rgba(215,178,122,.12),inset 0 0 80px rgba(215,178,122,.04)}
  .preview-floor{position:absolute;bottom:72px;width:58%;height:32px;background:rgba(215,178,122,.22);filter:blur(28px);border-radius:50%}
  .preview-image{position:relative;z-index:2;width:82%;height:78%;object-fit:contain;filter:drop-shadow(0 35px 30px rgba(0,0,0,.66))}
  .fallback-bottle{position:relative;z-index:2;width:210px;height:370px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 32px 28px rgba(0,0,0,.7))}
  .fallback-cap{width:102px;height:78px;border-radius:38px 38px 12px 12px;background:linear-gradient(135deg,#f2d7a4,#8c642a 44%,#eed39c);border:1px solid #f3d7a1}
  .fallback-glass{width:210px;height:290px;border-radius:26px 26px 34px 34px;border:1px solid rgba(245,220,178,.6);background:linear-gradient(145deg,rgba(255,255,255,.19),rgba(0,0,0,.78));display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
  .fallback-glass span{font-family:Georgia,serif;font-size:34px;letter-spacing:5px;color:#e5c078}.fallback-glass small{margin-top:12px;font-size:11px;letter-spacing:2px}
  .live-label{position:absolute;z-index:4;bottom:24px;left:24px;right:24px;padding:16px 18px;border:1px solid rgba(215,178,122,.26);background:rgba(5,5,5,.72);backdrop-filter:blur(12px);display:grid;gap:5px;text-align:center}
  .live-label span{font-family:Georgia,serif;color:#d7b27a;font-size:18px;letter-spacing:5px}.live-label strong{font-size:14px;letter-spacing:1.4px;text-transform:uppercase}.live-label small{font-size:9px;letter-spacing:1.8px;color:rgba(245,240,232,.58)}
  .preview-details{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:rgba(215,178,122,.15);border:1px solid rgba(215,178,122,.12)}
  .preview-details div{padding:15px 16px;background:#0b0b0b;display:grid;gap:5px}.preview-details span{font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:rgba(245,240,232,.48)}.preview-details strong{font-size:14px;font-weight:650}
  .preview-price{display:flex;align-items:end;justify-content:space-between;padding:22px 4px 2px}.preview-price span{font-size:12px;text-transform:uppercase;letter-spacing:1.4px;color:rgba(245,240,232,.52)}.preview-price strong{font-family:Georgia,serif;font-size:32px;color:#e4bd75;font-weight:400}
  .atelier-options{display:grid;gap:16px}
  .choice-section{border:1px solid rgba(215,178,122,.18);border-radius:24px;background:rgba(255,255,255,.025);padding:24px;transition:.3s ease}
  .choice-section:hover{border-color:rgba(215,178,122,.32);background:rgba(255,255,255,.035)}
  .choice-section>header{display:flex;gap:14px;align-items:flex-start;margin-bottom:19px}.choice-section>header>span{width:36px;height:36px;border-radius:50%;border:1px solid rgba(215,178,122,.44);display:grid;place-items:center;color:#d7b27a;font-size:11px;font-weight:800;flex:0 0 auto}.choice-section h2{font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0}.choice-section p{margin:4px 0 0;font-size:13px;color:rgba(245,240,232,.5)}
  .choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.choice-grid.oils{grid-template-columns:repeat(2,minmax(0,1fr))}
  .choice-card{position:relative;min-height:112px;padding:18px;text-align:left;color:#f5f0e8;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012));cursor:pointer;display:grid;align-content:start;gap:7px;transition:.24s ease}
  .choice-card:hover{transform:translateY(-2px);border-color:rgba(215,178,122,.42)}.choice-card.selected{border-color:#d7b27a;box-shadow:0 0 0 1px rgba(215,178,122,.28),0 18px 40px rgba(0,0,0,.2);background:linear-gradient(145deg,rgba(215,178,122,.14),rgba(255,255,255,.018))}
  .choice-card strong{font-size:16px}.choice-card small{color:rgba(245,240,232,.53);line-height:1.45}.choice-card em{font-style:normal;color:#d7b27a;font-size:12px;margin-top:auto}.choice-check{position:absolute;right:13px;top:13px;width:21px;height:21px;border-radius:50%;border:1px solid rgba(215,178,122,.4);display:grid;place-items:center;font-size:10px;color:transparent}.choice-card.selected .choice-check{background:#d7b27a;color:#090909}
  .amount-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}.amount-card{padding:16px 8px;border-radius:14px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.025);color:#f5f0e8;cursor:pointer;display:grid;gap:5px;text-align:center}.amount-card strong{font-size:16px}.amount-card span{font-size:10px;color:rgba(245,240,232,.48)}.amount-card.selected{border-color:#d7b27a;background:rgba(215,178,122,.13);box-shadow:inset 0 0 0 1px rgba(215,178,122,.24)}
  .name-field{position:relative}.name-field input{width:100%;box-sizing:border-box;padding:17px 64px 17px 17px;border-radius:15px;border:1px solid rgba(215,178,122,.28);background:#0a0a0a;color:#f5f0e8;font:inherit;outline:none}.name-field input:focus{border-color:#d7b27a;box-shadow:0 0 0 3px rgba(215,178,122,.08)}.name-field span{position:absolute;right:17px;top:50%;transform:translateY(-50%);font-size:11px;color:rgba(245,240,232,.38)}.field-note{font-size:11px!important;margin-top:10px!important}
  .order-review{border-radius:26px;padding:28px;background:linear-gradient(135deg,#d9b36d,#9b6b2b);color:#080808;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;box-shadow:0 28px 70px rgba(0,0,0,.32)}
  .order-review p{font-size:10px;letter-spacing:2.4px;font-weight:900;margin:0 0 7px}.order-review h2{font-family:Georgia,serif;font-weight:400;font-size:32px;margin:0}.order-review>div>span{display:block;font-size:12px;opacity:.65;margin-top:8px}.review-price{text-align:right}.review-price small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1.4px;opacity:.6}.review-price strong{font-family:Georgia,serif;font-weight:400;font-size:36px}
  .add-button{grid-column:1/-1;border:0;border-radius:999px;background:#080808;color:#f5f0e8;padding:17px 22px;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:.2s ease}.add-button:hover{transform:translateY(-2px);box-shadow:0 14px 26px rgba(0,0,0,.25)}.add-button:disabled{opacity:.45;cursor:not-allowed;transform:none}.add-button b{font-size:20px}
  .price-note{grid-column:1/-1;display:flex!important;flex-wrap:wrap;gap:16px!important;margin:0!important}.price-note span{font-size:10px!important;text-transform:uppercase;letter-spacing:1.2px;opacity:.58!important;margin:0!important}
  .home-fragrance-link{display:flex;align-items:center;justify-content:space-between;text-decoration:none;color:#d7b27a;border:1px solid rgba(215,178,122,.2);border-radius:18px;padding:17px 20px;font-size:13px;font-weight:700}.home-fragrance-link:hover{background:rgba(215,178,122,.07)}
  .atelier-message{border:1px solid rgba(215,178,122,.28);padding:26px;border-radius:20px;display:grid;gap:6px;background:rgba(255,255,255,.025)}.atelier-message strong{font-family:Georgia,serif;font-size:26px}.atelier-message span{color:rgba(245,240,232,.58)}.atelier-message.error{border-color:rgba(255,95,95,.35)}
  .atelier-center{display:grid;place-items:center;text-align:center}.atelier-loader{width:42px;height:42px;border-radius:50%;border:2px solid rgba(215,178,122,.18);border-top-color:#d7b27a;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .atelier-orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none}.orb-one{width:340px;height:340px;background:rgba(167,108,33,.1);top:14%;left:-100px}.orb-two{width:300px;height:300px;background:rgba(215,178,122,.07);right:-80px;top:48%}
  @media(max-width:1050px){.atelier-builder{grid-template-columns:1fr}.preview-sticky{position:relative;top:auto}.preview-stage{height:500px}.amount-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:720px){.atelier-page{padding-top:18px}.atelier-shell{width:min(100% - 24px,1380px)}.atelier-promises{grid-template-columns:1fr;gap:7px}.atelier-intro h1{font-size:58px;letter-spacing:-2.5px}.atelier-lead{font-size:15px}.preview-stage{height:420px}.preview-image{width:92%}.choice-section{padding:18px;border-radius:19px}.choice-grid,.choice-grid.oils{grid-template-columns:1fr}.amount-grid{grid-template-columns:repeat(2,1fr)}.order-review{grid-template-columns:1fr}.review-price{text-align:left}.preview-details{grid-template-columns:1fr 1fr}}
`;
