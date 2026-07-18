"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

type Tab = "bottles" | "oils" | "amounts" | "addons" | "pricing";
type Bottle = { id: string; name: string; capacity_ml: number; price: number; image_url: string | null; description: string | null; active: boolean };
type Oil = { id: string; name: string; price_per_unit: number; unit: "ml" | "g"; image_url: string | null; description: string | null; active: boolean };
type Amount = { id: string; amount: number; unit: "ml" | "g"; active: boolean };
type Addon = { id: string; category: string; name: string; price: number; active: boolean };
type Settings = { id?: string; alcohol_price_per_ml: number; packaging_cost: number; profit_markup_percent: number; default_bottle_capacity_ml: number };

const gold = "#d7b27a";
const cream = "#f5f0e8";
const input: CSSProperties = { width: "100%", background: "rgba(255,255,255,.045)", color: cream, border: "1px solid rgba(215,178,122,.26)", padding: "12px 13px", borderRadius: 12, outline: "none" };
const button: CSSProperties = { border: 0, padding: "11px 16px", borderRadius: 999, fontWeight: 800, cursor: "pointer" };
const card: CSSProperties = { border: "1px solid rgba(215,178,122,.24)", background: "linear-gradient(180deg,rgba(255,255,255,.045),rgba(0,0,0,.24))", borderRadius: 20, padding: 22 };

function money(value: number) { return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Number(value) || 0); }

export default function CustomPerfumeAdminPanel() {
  const [tab, setTab] = useState<Tab>("bottles");
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [oils, setOils] = useState<Oil[]>([]);
  const [amounts, setAmounts] = useState<Amount[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [settings, setSettings] = useState<Settings>({ alcohol_price_per_ml: 0, packaging_cost: 0, profit_markup_percent: 0, default_bottle_capacity_ml: 50 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [bottleForm, setBottleForm] = useState({ id: "", name: "", capacity_ml: "50", price: "", image_url: "", description: "", active: true });
  const [oilForm, setOilForm] = useState({ id: "", name: "", price_per_unit: "", unit: "ml" as "ml" | "g", image_url: "", description: "", active: true });
  const [amountForm, setAmountForm] = useState({ id: "", amount: "15", unit: "ml" as "ml" | "g", active: true });
  const [addonForm, setAddonForm] = useState({ id: "", category: "bottle_color", name: "", price: "0", active: true });

  async function loadAll() {
    setError("");
    const [b, o, a, ad, s] = await Promise.all([
      supabase.from("custom_bottles").select("*").order("created_at"),
      supabase.from("fragrance_oils").select("*").order("created_at"),
      supabase.from("oil_amount_options").select("*").order("amount"),
      supabase.from("custom_perfume_addons").select("*").order("category").order("name"),
      supabase.from("custom_perfume_settings").select("*").limit(1).maybeSingle(),
    ]);
    const firstError = b.error || o.error || a.error || ad.error || s.error;
    if (firstError) setError(firstError.message);
    setBottles((b.data || []) as Bottle[]);
    setOils((o.data || []) as Oil[]);
    setAmounts((a.data || []) as Amount[]);
    setAddons((ad.data || []) as Addon[]);
    if (s.data) setSettings(s.data as Settings);
  }

  useEffect(() => { loadAll(); }, []);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>, kind: "bottle" | "oil") {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Please choose an image under 5 MB."); return; }
    setBusy(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `custom-perfume/${kind}-${Date.now()}.${ext}`;
    const { error: upError } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
    if (upError) setError(upError.message);
    else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      if (kind === "bottle") setBottleForm((v) => ({ ...v, image_url: data.publicUrl }));
      else setOilForm((v) => ({ ...v, image_url: data.publicUrl }));
    }
    setBusy(false);
    event.target.value = "";
  }

  async function saveBottle() {
    if (!bottleForm.name.trim()) return setError("Enter the bottle name.");
    setBusy(true); setError(""); setMessage("");
    const payload = { name: bottleForm.name.trim(), capacity_ml: Number(bottleForm.capacity_ml), price: Number(bottleForm.price), image_url: bottleForm.image_url || null, description: bottleForm.description || null, active: bottleForm.active };
    const result = bottleForm.id ? await supabase.from("custom_bottles").update(payload).eq("id", bottleForm.id) : await supabase.from("custom_bottles").insert(payload);
    if (result.error) setError(result.error.message); else { setMessage("Bottle saved."); setBottleForm({ id: "", name: "", capacity_ml: "50", price: "", image_url: "", description: "", active: true }); await loadAll(); }
    setBusy(false);
  }

  async function saveOil() {
    if (!oilForm.name.trim()) return setError("Enter the oil name.");
    setBusy(true); setError(""); setMessage("");
    const payload = { name: oilForm.name.trim(), price_per_unit: Number(oilForm.price_per_unit), unit: oilForm.unit, image_url: oilForm.image_url || null, description: oilForm.description || null, active: oilForm.active };
    const result = oilForm.id ? await supabase.from("fragrance_oils").update(payload).eq("id", oilForm.id) : await supabase.from("fragrance_oils").insert(payload);
    if (result.error) setError(result.error.message); else { setMessage("Oil saved."); setOilForm({ id: "", name: "", price_per_unit: "", unit: "ml", image_url: "", description: "", active: true }); await loadAll(); }
    setBusy(false);
  }

  async function saveAmount() {
    setBusy(true); setError("");
    const payload = { amount: Number(amountForm.amount), unit: amountForm.unit, active: amountForm.active };
    const result = amountForm.id ? await supabase.from("oil_amount_options").update(payload).eq("id", amountForm.id) : await supabase.from("oil_amount_options").insert(payload);
    if (result.error) setError(result.error.message); else { setMessage("Oil amount saved."); setAmountForm({ id: "", amount: "15", unit: "ml", active: true }); await loadAll(); }
    setBusy(false);
  }

  async function saveAddon() {
    if (!addonForm.name.trim()) return setError("Enter the option name.");
    setBusy(true); setError("");
    const payload = { category: addonForm.category, name: addonForm.name.trim(), price: Number(addonForm.price), active: addonForm.active };
    const result = addonForm.id ? await supabase.from("custom_perfume_addons").update(payload).eq("id", addonForm.id) : await supabase.from("custom_perfume_addons").insert(payload);
    if (result.error) setError(result.error.message); else { setMessage("Option saved."); setAddonForm({ id: "", category: "bottle_color", name: "", price: "0", active: true }); await loadAll(); }
    setBusy(false);
  }

  async function saveSettings() {
    setBusy(true); setError("");
    const payload = { alcohol_price_per_ml: Number(settings.alcohol_price_per_ml), packaging_cost: Number(settings.packaging_cost), profit_markup_percent: Number(settings.profit_markup_percent), default_bottle_capacity_ml: Number(settings.default_bottle_capacity_ml) };
    const result = settings.id ? await supabase.from("custom_perfume_settings").update(payload).eq("id", settings.id) : await supabase.from("custom_perfume_settings").insert(payload).select().single();
    if (result.error) setError(result.error.message); else { setMessage("Pricing settings saved."); await loadAll(); }
    setBusy(false);
  }

  async function remove(table: string, id: string) {
    if (!window.confirm("Delete this item?")) return;
    const { error: removeError } = await supabase.from(table).delete().eq("id", id);
    if (removeError) setError(removeError.message); else { setMessage("Item deleted."); await loadAll(); }
  }

  const addonGroups = useMemo(() => [
    ["bottle_color", "Bottle colours"], ["cap_color", "Cap colours"], ["sprayer_color", "Sprayer colours"], ["label_color", "Label colours"], ["personalization", "Personalisation"],
  ] as const, []);

  return <section style={{ marginTop: 34 }}>
    <div style={{ ...card, padding: 26 }}>
      <p style={{ color: gold, letterSpacing: 3, fontSize: 12, margin: 0 }}>CREATE YOUR OWN PERFUME</p>
      <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 400, fontSize: 38, margin: "8px 0 8px" }}>Atelier Management</h2>
      <p style={{ color: "rgba(245,240,232,.66)", marginTop: 0 }}>Manage bottles, oils, concentration choices, custom colours and the complete price calculation.</p>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 20 }}>
        {([['bottles','Bottles'],['oils','Oils'],['amounts','Oil amounts'],['addons','Colours & extras'],['pricing','Alcohol & pricing']] as [Tab,string][]).map(([key,label]) => <button key={key} onClick={() => setTab(key)} style={{ ...button, background: tab === key ? "linear-gradient(90deg,#f4d49c,#b8873b)" : "rgba(255,255,255,.06)", color: tab === key ? "#111" : cream, border: "1px solid rgba(215,178,122,.25)" }}>{label}</button>)}
      </div>
    </div>

    {(error || message) && <div style={{ marginTop: 16, padding: 14, borderRadius: 14, border: `1px solid ${error ? 'rgba(255,90,90,.5)' : 'rgba(120,255,170,.4)'}`, color: error ? '#ffb3b3' : '#b6ffd0' }}>{error || message}</div>}

    {tab === "bottles" && <CrudLayout title={bottleForm.id ? "Edit bottle" : "Add bottle"} form={<>
      <input style={input} placeholder="Bottle name" value={bottleForm.name} onChange={(e)=>setBottleForm({...bottleForm,name:e.target.value})}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><input style={input} type="number" placeholder="Capacity ml" value={bottleForm.capacity_ml} onChange={(e)=>setBottleForm({...bottleForm,capacity_ml:e.target.value})}/><input style={input} type="number" step="0.01" placeholder="Bottle price €" value={bottleForm.price} onChange={(e)=>setBottleForm({...bottleForm,price:e.target.value})}/></div>
      <textarea style={{...input,minHeight:90}} placeholder="Description" value={bottleForm.description} onChange={(e)=>setBottleForm({...bottleForm,description:e.target.value})}/>
      <input style={input} placeholder="Image URL" value={bottleForm.image_url} onChange={(e)=>setBottleForm({...bottleForm,image_url:e.target.value})}/>
      <label style={{...button,display:'block',textAlign:'center',background:'rgba(215,178,122,.12)',color:gold,border:'1px solid rgba(215,178,122,.35)'}}>Upload bottle image<input type="file" accept="image/*" hidden onChange={(e)=>uploadImage(e,'bottle')}/></label>
      <Check checked={bottleForm.active} onChange={(v)=>setBottleForm({...bottleForm,active:v})}/>
      <Save busy={busy} onClick={saveBottle}/>
    </>} list={bottles.map(x=><Row key={x.id} image={x.image_url} title={x.name} meta={`${x.capacity_ml} ml · ${money(x.price)}`} active={x.active} onEdit={()=>setBottleForm({id:x.id,name:x.name,capacity_ml:String(x.capacity_ml),price:String(x.price),image_url:x.image_url||'',description:x.description||'',active:x.active})} onDelete={()=>remove('custom_bottles',x.id)}/>)}/>} 

    {tab === "oils" && <CrudLayout title={oilForm.id ? "Edit oil" : "Add fragrance oil"} form={<>
      <input style={input} placeholder="Oil name" value={oilForm.name} onChange={(e)=>setOilForm({...oilForm,name:e.target.value})}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:10}}><input style={input} type="number" step="0.001" placeholder="Price per unit €" value={oilForm.price_per_unit} onChange={(e)=>setOilForm({...oilForm,price_per_unit:e.target.value})}/><select style={input} value={oilForm.unit} onChange={(e)=>setOilForm({...oilForm,unit:e.target.value as 'ml'|'g'})}><option value="ml">per ml</option><option value="g">per gram</option></select></div>
      <textarea style={{...input,minHeight:90}} placeholder="Description / notes" value={oilForm.description} onChange={(e)=>setOilForm({...oilForm,description:e.target.value})}/>
      <input style={input} placeholder="Image URL" value={oilForm.image_url} onChange={(e)=>setOilForm({...oilForm,image_url:e.target.value})}/>
      <label style={{...button,display:'block',textAlign:'center',background:'rgba(215,178,122,.12)',color:gold,border:'1px solid rgba(215,178,122,.35)'}}>Upload oil image<input type="file" accept="image/*" hidden onChange={(e)=>uploadImage(e,'oil')}/></label>
      <Check checked={oilForm.active} onChange={(v)=>setOilForm({...oilForm,active:v})}/><Save busy={busy} onClick={saveOil}/>
    </>} list={oils.map(x=><Row key={x.id} image={x.image_url} title={x.name} meta={`${money(x.price_per_unit)} / ${x.unit}`} active={x.active} onEdit={()=>setOilForm({id:x.id,name:x.name,price_per_unit:String(x.price_per_unit),unit:x.unit,image_url:x.image_url||'',description:x.description||'',active:x.active})} onDelete={()=>remove('fragrance_oils',x.id)}/>)}/>} 

    {tab === "amounts" && <CrudLayout title="Oil amount choices" form={<><div style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:10}}><input style={input} type="number" step="0.1" value={amountForm.amount} onChange={(e)=>setAmountForm({...amountForm,amount:e.target.value})}/><select style={input} value={amountForm.unit} onChange={(e)=>setAmountForm({...amountForm,unit:e.target.value as 'ml'|'g'})}><option value="ml">ml</option><option value="g">g</option></select></div><Check checked={amountForm.active} onChange={(v)=>setAmountForm({...amountForm,active:v})}/><Save busy={busy} onClick={saveAmount}/></>} list={amounts.map(x=><Row key={x.id} title={`${x.amount} ${x.unit}`} meta="Customer concentration option" active={x.active} onEdit={()=>setAmountForm({id:x.id,amount:String(x.amount),unit:x.unit,active:x.active})} onDelete={()=>remove('oil_amount_options',x.id)}/>)}/>} 

    {tab === "addons" && <CrudLayout title="Colours and personalisation" form={<><select style={input} value={addonForm.category} onChange={(e)=>setAddonForm({...addonForm,category:e.target.value})}>{addonGroups.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><input style={input} placeholder="Option name" value={addonForm.name} onChange={(e)=>setAddonForm({...addonForm,name:e.target.value})}/><input style={input} type="number" step="0.01" placeholder="Additional price €" value={addonForm.price} onChange={(e)=>setAddonForm({...addonForm,price:e.target.value})}/><Check checked={addonForm.active} onChange={(v)=>setAddonForm({...addonForm,active:v})}/><Save busy={busy} onClick={saveAddon}/></>} list={addons.map(x=><Row key={x.id} title={x.name} meta={`${addonGroups.find(g=>g[0]===x.category)?.[1] || x.category} · +${money(x.price)}`} active={x.active} onEdit={()=>setAddonForm({id:x.id,category:x.category,name:x.name,price:String(x.price),active:x.active})} onDelete={()=>remove('custom_perfume_addons',x.id)}/>)}/>} 

    {tab === "pricing" && <div style={{...card,marginTop:18,maxWidth:720}}><h3 style={{fontSize:28,fontFamily:'Georgia,serif',fontWeight:400,marginTop:0}}>Alcohol and final pricing</h3><div style={{display:'grid',gap:12}}>
      <Field label="Alcohol price per ml (€)"><input style={input} type="number" step="0.0001" value={settings.alcohol_price_per_ml} onChange={(e)=>setSettings({...settings,alcohol_price_per_ml:Number(e.target.value)})}/></Field>
      <Field label="Packaging cost per perfume (€)"><input style={input} type="number" step="0.01" value={settings.packaging_cost} onChange={(e)=>setSettings({...settings,packaging_cost:Number(e.target.value)})}/></Field>
      <Field label="Profit markup (%)"><input style={input} type="number" step="0.1" value={settings.profit_markup_percent} onChange={(e)=>setSettings({...settings,profit_markup_percent:Number(e.target.value)})}/></Field>
      <Field label="Default bottle capacity (ml)"><input style={input} type="number" value={settings.default_bottle_capacity_ml} onChange={(e)=>setSettings({...settings,default_bottle_capacity_ml:Number(e.target.value)})}/></Field>
      <Save busy={busy} onClick={saveSettings}/>
      <p style={{color:'rgba(245,240,232,.58)',fontSize:13}}>Formula: bottle + oil + alcohol + packaging + selected extras, then profit percentage.</p>
    </div></div>}
  </section>;
}

function CrudLayout({title,form,list}:{title:string;form:ReactNode;list:ReactNode[]}) { return <div style={{display:'grid',gridTemplateColumns:'minmax(290px,420px) 1fr',gap:20,marginTop:18,alignItems:'start'}}><div style={card}><h3 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:28,marginTop:0}}>{title}</h3><div style={{display:'grid',gap:12}}>{form}</div></div><div style={card}><h3 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:28,marginTop:0}}>Current items</h3><div style={{display:'grid',gap:10}}>{list.length?list:<p style={{color:'rgba(245,240,232,.6)'}}>No items yet.</p>}</div></div></div> }
function Row({image,title,meta,active,onEdit,onDelete}:{image?:string|null;title:string;meta:string;active:boolean;onEdit:()=>void;onDelete:()=>void}) { return <div style={{display:'grid',gridTemplateColumns:image?'58px 1fr auto':'1fr auto',gap:12,alignItems:'center',padding:12,border:'1px solid rgba(255,255,255,.1)',borderRadius:15,background:active?'rgba(255,255,255,.025)':'rgba(255,0,0,.05)'}}>{image&&<img src={image} alt="" style={{width:58,height:58,objectFit:'cover',borderRadius:12}}/>}<div><strong>{title}</strong><div style={{color:gold,fontSize:13,marginTop:4}}>{meta}</div></div><div style={{display:'flex',gap:7}}><button style={{...button,background:'rgba(255,255,255,.07)',color:cream}} onClick={onEdit}>Edit</button><button style={{...button,background:'rgba(255,0,0,.1)',color:'#ffb3b3'}} onClick={onDelete}>Delete</button></div></div> }
function Check({checked,onChange}:{checked:boolean;onChange:(v:boolean)=>void}) { return <label style={{display:'flex',gap:9,alignItems:'center',fontSize:14,color:'rgba(245,240,232,.8)'}}><input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)}/> Visible to customers</label> }
function Save({busy,onClick}:{busy:boolean;onClick:()=>void}) { return <button disabled={busy} onClick={onClick} style={{...button,background:'linear-gradient(90deg,#f4d49c,#b8873b)',color:'#111',opacity:busy?.6:1}}>{busy?'Saving...':'Save'}</button> }
function Field({label,children}:{label:string;children:ReactNode}) { return <label style={{display:'grid',gap:7,color:'rgba(245,240,232,.8)',fontSize:14}}>{label}{children}</label> }
