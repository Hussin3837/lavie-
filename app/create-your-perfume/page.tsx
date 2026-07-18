"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCart } from "../../components/CartContext";
import { supabase } from "../../lib/supabase";

type Bottle = { id:string; name:string; capacity_ml:number; price:number; image_url:string|null; description:string|null };
type Oil = { id:string; name:string; price_per_unit:number; unit:"ml"|"g"; image_url:string|null; description:string|null };
type Amount = { id:string; amount:number; unit:"ml"|"g" };
type Addon = { id:string; category:string; name:string; price:number };
type Settings = { alcohol_price_per_ml:number; packaging_cost:number; profit_markup_percent:number; default_bottle_capacity_ml:number };

const fallbackSettings: Settings = { alcohol_price_per_ml:0, packaging_cost:0, profit_markup_percent:0, default_bottle_capacity_ml:50 };

export default function CreateYourPerfumePage() {
  const { addItem, openCart } = useCart();
  const [bottles,setBottles]=useState<Bottle[]>([]); const [oils,setOils]=useState<Oil[]>([]); const [amounts,setAmounts]=useState<Amount[]>([]); const [addons,setAddons]=useState<Addon[]>([]); const [settings,setSettings]=useState<Settings>(fallbackSettings);
  const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [bottleId,setBottleId]=useState(""); const [oilId,setOilId]=useState(""); const [amountId,setAmountId]=useState(""); const [selectedAddons,setSelectedAddons]=useState<Record<string,string>>({}); const [personalName,setPersonalName]=useState("");

  useEffect(()=>{(async()=>{ setLoading(true); const [b,o,a,ad,s]=await Promise.all([
    supabase.from('custom_bottles').select('*').eq('active',true).order('created_at'),
    supabase.from('fragrance_oils').select('*').eq('active',true).order('created_at'),
    supabase.from('oil_amount_options').select('*').eq('active',true).order('amount'),
    supabase.from('custom_perfume_addons').select('*').eq('active',true).order('category').order('name'),
    supabase.from('custom_perfume_settings').select('*').limit(1).maybeSingle(),
  ]); const first=b.error||o.error||a.error||ad.error||s.error; if(first)setError(first.message); const bd=(b.data||[]) as Bottle[], od=(o.data||[]) as Oil[], am=(a.data||[]) as Amount[]; setBottles(bd);setOils(od);setAmounts(am);setAddons((ad.data||[]) as Addon[]); if(s.data)setSettings(s.data as Settings); setBottleId(bd[0]?.id||'');setOilId(od[0]?.id||'');setAmountId(am[0]?.id||'');setLoading(false); })()},[]);

  const bottle=bottles.find(x=>x.id===bottleId); const oil=oils.find(x=>x.id===oilId); const amount=amounts.find(x=>x.id===amountId);
  const addonGroups=useMemo(()=>Object.entries(addons.reduce<Record<string,Addon[]>>((acc,x)=>{(acc[x.category] ||= []).push(x);return acc},{})),[addons]);
  const chosenAddons=useMemo(()=>Object.values(selectedAddons).map(id=>addons.find(x=>x.id===id)).filter(Boolean) as Addon[],[selectedAddons,addons]);
  const breakdown=useMemo(()=>{ if(!bottle||!oil||!amount)return {oilCost:0,alcoholMl:0,alcoholCost:0,extras:0,subtotal:0,profit:0,total:0}; const oilCost=amount.amount*oil.price_per_unit; const alcoholMl=Math.max(0,bottle.capacity_ml-(amount.unit==='ml'?amount.amount:amount.amount)); const alcoholCost=alcoholMl*settings.alcohol_price_per_ml; const extras=chosenAddons.reduce((s,x)=>s+x.price,0)+(personalName.trim()?addons.find(x=>x.category==='personalization')?.price||0:0); const subtotal=bottle.price+oilCost+alcoholCost+settings.packaging_cost+extras; const profit=subtotal*(settings.profit_markup_percent/100); return {oilCost,alcoholMl,alcoholCost,extras,subtotal,profit,total:Number((subtotal+profit).toFixed(2))}; },[bottle,oil,amount,settings,chosenAddons,personalName,addons]);

  function chooseAddon(category:string,id:string){setSelectedAddons(v=>({...v,[category]:v[category]===id?'':id}))}
  function addCustom(){ if(!bottle||!oil||!amount)return; const addonsText=chosenAddons.map(x=>x.name).join(', '); addItem({id:`custom-${Date.now()}`,name:`Custom LA VIE · ${oil.name} · ${amount.amount}${amount.unit}${personalName.trim()?` · ${personalName.trim()}`:''}${addonsText?` · ${addonsText}`:''}`,price:breakdown.total,image:bottle.image_url||oil.image_url||'/images/logo.png'});openCart(); }

  if(loading)return <main className="custom-perfume-page"><div className="custom-perfume-shell"><p>Loading the LA VIE Atelier...</p></div></main>;
  if(error)return <main className="custom-perfume-page"><div className="custom-perfume-shell"><Link href="/" className="custom-back-link">← Back to LA VIE</Link><p>{error}</p><p>Run the supplied Supabase SQL first.</p></div></main>;

  return <main className="custom-perfume-page"><div className="custom-perfume-shell"><Link href="/" className="custom-back-link">← Back to LA VIE</Link><header className="custom-builder-heading"><p className="eyebrow">THE LA VIE ATELIER</p><h1>Create Your Own Perfume</h1><p>Choose every detail of your perfume. The price is calculated instantly from the bottle, oil, alcohol, packaging and your personal options.</p></header>
  <div className="custom-builder-grid"><section className="custom-preview-card"><div className="custom-preview-glow"/>{bottle?.image_url?<img src={bottle.image_url} alt={bottle.name} style={{width:'72%',maxHeight:420,objectFit:'contain',position:'relative',zIndex:2}}/>:<div className="custom-bottle classic"><div className="custom-bottle-cap"/><div className="custom-bottle-label"><div><strong>LA VIE</strong><small>{personalName||oil?.name||'YOUR PERFUME'}</small></div></div></div>}<div className="custom-preview-summary"><div><span>Bottle</span><strong>{bottle?.name}</strong></div><div><span>Fragrance oil</span><strong>{oil?.name}</strong></div><div><span>Oil concentration</span><strong>{amount?.amount} {amount?.unit} / {bottle?.capacity_ml} ml</strong></div><div><span>Alcohol</span><strong>{breakdown.alcoholMl.toFixed(1)} ml</strong></div></div></section>
  <section className="custom-config-card"><Step n="01" title="Choose your bottle"><div className="custom-choice-grid">{bottles.map(x=><button key={x.id} className={`custom-choice ${bottleId===x.id?'is-selected':''}`} onClick={()=>setBottleId(x.id)}><strong>{x.name}</strong><small>{x.capacity_ml} ml · €{x.price.toFixed(2)}</small></button>)}</div></Step>
  <Step n="02" title="Choose your fragrance oil"><div className="custom-choice-grid custom-oil-grid">{oils.map(x=><button key={x.id} className={`custom-choice ${oilId===x.id?'is-selected':''}`} onClick={()=>setOilId(x.id)}><strong>{x.name}</strong><small>€{x.price_per_unit.toFixed(3)} / {x.unit}</small></button>)}</div></Step>
  <Step n="03" title="How much fragrance oil?"><div className="custom-ml-options">{amounts.filter(x=>!oil||x.unit===oil.unit).map(x=><button key={x.id} className={`custom-choice ${amountId===x.id?'is-selected':''}`} onClick={()=>setAmountId(x.id)}><strong>{x.amount} {x.unit}</strong><small>{bottle?Math.round(x.amount/bottle.capacity_ml*100):0}%</small></button>)}</div></Step>
  {addonGroups.filter(([cat])=>cat!=='personalization').map(([cat,items],i)=><Step key={cat} n={String(i+4).padStart(2,'0')} title={cat.replaceAll('_',' ')}><div className="custom-choice-grid">{items.map(x=><button key={x.id} className={`custom-choice ${selectedAddons[cat]===x.id?'is-selected':''}`} onClick={()=>chooseAddon(cat,x.id)}><strong>{x.name}</strong><small>{x.price?`+€${x.price.toFixed(2)}`:'Included'}</small></button>)}</div></Step>)}
  <Step n="08" title="Personalise the label"><input value={personalName} onChange={e=>setPersonalName(e.target.value.slice(0,24))} placeholder="Your name (optional)" style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid rgba(215,178,122,.35)',background:'rgba(255,255,255,.04)',color:'inherit'}}/></Step>
  <div className="custom-total-row"><div><span>Your custom perfume</span><strong>€{breakdown.total.toFixed(2)}</strong><small style={{display:'block',opacity:.65,marginTop:5}}>Bottle €{bottle?.price.toFixed(2)} · Oil €{breakdown.oilCost.toFixed(2)} · Alcohol €{breakdown.alcoholCost.toFixed(2)} · Extras €{breakdown.extras.toFixed(2)}</small></div><button className="custom-add-button" onClick={addCustom} disabled={!bottle||!oil||!amount}>Add Custom Perfume to Cart</button></div></section></div></div></main>;
}
function Step({n,title,children}:{n:string;title:string;children:ReactNode}){return <div className="custom-step"><div className="custom-step-title"><span>{n}</span><h2>{title}</h2></div>{children}</div>}
