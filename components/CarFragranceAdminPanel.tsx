"use client";

import { useEffect, useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

type Product = { id:string; name:string; base_price:number; image_url:string|null; description:string|null; active:boolean };
type Scent = { id:string; name:string; price:number; image_url:string|null; description:string|null; active:boolean };
type Size = { id:string; label:string; volume_ml:number; price:number; active:boolean };
type Intensity = { id:string; name:string; multiplier:number; description:string|null; active:boolean };
type Settings = { id?:string; packaging_cost:number; personalization_price:number; profit_markup_percent:number };

type Tab = "products" | "scents" | "sizes" | "intensities" | "pricing";

const gold = "#d7b27a";
const cream = "#f5f0e8";
const input: CSSProperties = { width:"100%", background:"rgba(255,255,255,.045)", color:cream, border:"1px solid rgba(215,178,122,.26)", padding:"12px 13px", borderRadius:12, outline:"none" };
const button: CSSProperties = { border:0, padding:"11px 16px", borderRadius:999, fontWeight:800, cursor:"pointer" };
const card: CSSProperties = { border:"1px solid rgba(215,178,122,.24)", background:"linear-gradient(180deg,rgba(255,255,255,.045),rgba(0,0,0,.24))", borderRadius:20, padding:22 };

function money(value:number){ return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(value)||0); }

export default function CarFragranceAdminPanel(){
  const [tab,setTab]=useState<Tab>("products");
  const [products,setProducts]=useState<Product[]>([]);
  const [scents,setScents]=useState<Scent[]>([]);
  const [sizes,setSizes]=useState<Size[]>([]);
  const [intensities,setIntensities]=useState<Intensity[]>([]);
  const [settings,setSettings]=useState<Settings>({packaging_cost:0,personalization_price:0,profit_markup_percent:0});
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  const [productForm,setProductForm]=useState({id:"",name:"Car Spray",base_price:"",image_url:"",description:"",active:true});
  const [scentForm,setScentForm]=useState({id:"",name:"",price:"0",image_url:"",description:"",active:true});
  const [sizeForm,setSizeForm]=useState({id:"",label:"10 ml",volume_ml:"10",price:"0",active:true});
  const [intensityForm,setIntensityForm]=useState({id:"",name:"Classic",multiplier:"1",description:"",active:true});

  async function loadAll(){
    setError("");
    const [p,s,z,i,st]=await Promise.all([
      supabase.from("car_fragrance_products").select("*").order("created_at"),
      supabase.from("car_fragrance_scents").select("*").order("created_at"),
      supabase.from("car_fragrance_sizes").select("*").order("volume_ml"),
      supabase.from("car_fragrance_intensities").select("*").order("multiplier"),
      supabase.from("car_fragrance_settings").select("*").limit(1).maybeSingle(),
    ]);
    const first=p.error||s.error||z.error||i.error||st.error;
    if(first)setError(first.message);
    setProducts((p.data||[]) as Product[]);
    setScents((s.data||[]) as Scent[]);
    setSizes((z.data||[]) as Size[]);
    setIntensities((i.data||[]) as Intensity[]);
    if(st.data)setSettings(st.data as Settings);
  }

  useEffect(()=>{ void loadAll(); },[]);

  async function uploadImage(event:ChangeEvent<HTMLInputElement>,kind:"product"|"scent"){
    const file=event.target.files?.[0];
    if(!file)return;
    if(!file.type.startsWith("image/")||file.size>5*1024*1024){setError("Please choose an image under 5 MB.");return;}
    setBusy(true);
    const ext=file.name.split(".").pop()||"jpg";
    const path=`car-fragrance/${kind}-${Date.now()}.${ext}`;
    const {error:upError}=await supabase.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});
    if(upError)setError(upError.message);
    else{
      const {data}=supabase.storage.from("product-images").getPublicUrl(path);
      if(kind==="product")setProductForm(v=>({...v,image_url:data.publicUrl}));
      else setScentForm(v=>({...v,image_url:data.publicUrl}));
    }
    setBusy(false);
    event.target.value="";
  }

  async function save(table:string,payload:Record<string,unknown>,id:string,success:string,reset:()=>void){
    setBusy(true);setError("");setMessage("");
    const result=id?await supabase.from(table).update(payload).eq("id",id):await supabase.from(table).insert(payload);
    if(result.error)setError(result.error.message);
    else{setMessage(success);reset();await loadAll();}
    setBusy(false);
  }

  async function saveSettings(){
    setBusy(true);setError("");setMessage("");
    const payload={packaging_cost:Number(settings.packaging_cost),personalization_price:Number(settings.personalization_price),profit_markup_percent:Number(settings.profit_markup_percent)};
    const result=settings.id
      ?await supabase.from("car_fragrance_settings").update(payload).eq("id",settings.id)
      :await supabase.from("car_fragrance_settings").insert(payload).select().single();
    if(result.error)setError(result.error.message);
    else{setMessage("Car fragrance pricing saved.");await loadAll();}
    setBusy(false);
  }

  async function remove(table:string,id:string){
    if(!window.confirm("Delete this item?"))return;
    const {error:removeError}=await supabase.from(table).delete().eq("id",id);
    if(removeError)setError(removeError.message);
    else{setMessage("Item deleted.");await loadAll();}
  }

  return <section style={{marginTop:34}}>
    <div style={{...card,padding:26}}>
      <p style={{color:gold,letterSpacing:3,fontSize:12,margin:0}}>LA VIE CAR FRAGRANCE</p>
      <h2 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:38,margin:"8px 0"}}>Car Fragrance Management</h2>
      <p style={{color:"rgba(245,240,232,.66)",marginTop:0}}>Manage car fragrance products, scents, sizes, intensity and pricing.</p>
      <div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:20}}>
        {([["products","Products"],["scents","Scents"],["sizes","Sizes"],["intensities","Intensity"],["pricing","Pricing"]] as [Tab,string][]).map(([key,label])=>
          <button key={key} onClick={()=>setTab(key)} style={{...button,background:tab===key?"linear-gradient(90deg,#f4d49c,#b8873b)":"rgba(255,255,255,.06)",color:tab===key?"#111":cream,border:"1px solid rgba(215,178,122,.25)"}}>{label}</button>
        )}
      </div>
    </div>

    {(error||message)&&<div style={{marginTop:16,padding:14,borderRadius:14,border:`1px solid ${error?"rgba(255,90,90,.5)":"rgba(120,255,170,.4)"}`,color:error?"#ffb3b3":"#b6ffd0"}}>{error||message}</div>}

    {tab==="products"&&<CrudLayout title={productForm.id?"Edit product":"Add product"} form={<>
      <input style={input} placeholder="Car Spray / Hanging Diffuser..." value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})}/>
      <input style={input} type="number" step="0.01" placeholder="Base price €" value={productForm.base_price} onChange={e=>setProductForm({...productForm,base_price:e.target.value})}/>
      <textarea style={{...input,minHeight:90}} placeholder="Description" value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})}/>
      <input style={input} placeholder="Image URL" value={productForm.image_url} onChange={e=>setProductForm({...productForm,image_url:e.target.value})}/>
      <Upload onChange={e=>uploadImage(e,"product")}>Upload product image</Upload>
      <Check checked={productForm.active} onChange={v=>setProductForm({...productForm,active:v})}/>
      <Save busy={busy} onClick={()=>save("car_fragrance_products",{name:productForm.name.trim(),base_price:Number(productForm.base_price),image_url:productForm.image_url||null,description:productForm.description||null,active:productForm.active},productForm.id,"Car product saved.",()=>setProductForm({id:"",name:"Car Spray",base_price:"",image_url:"",description:"",active:true}))}/>
    </>} list={products.map(x=><Row key={x.id} image={x.image_url} title={x.name} meta={money(x.base_price)} active={x.active} onEdit={()=>setProductForm({id:x.id,name:x.name,base_price:String(x.base_price),image_url:x.image_url||"",description:x.description||"",active:x.active})} onDelete={()=>remove("car_fragrance_products",x.id)}/>)}/>}

    {tab==="scents"&&<CrudLayout title={scentForm.id?"Edit scent":"Add scent"} form={<>
      <input style={input} placeholder="Scent name" value={scentForm.name} onChange={e=>setScentForm({...scentForm,name:e.target.value})}/>
      <input style={input} type="number" step="0.01" placeholder="Additional price €" value={scentForm.price} onChange={e=>setScentForm({...scentForm,price:e.target.value})}/>
      <textarea style={{...input,minHeight:90}} placeholder="Description / notes" value={scentForm.description} onChange={e=>setScentForm({...scentForm,description:e.target.value})}/>
      <input style={input} placeholder="Image URL" value={scentForm.image_url} onChange={e=>setScentForm({...scentForm,image_url:e.target.value})}/>
      <Upload onChange={e=>uploadImage(e,"scent")}>Upload scent image</Upload>
      <Check checked={scentForm.active} onChange={v=>setScentForm({...scentForm,active:v})}/>
      <Save busy={busy} onClick={()=>save("car_fragrance_scents",{name:scentForm.name.trim(),price:Number(scentForm.price),image_url:scentForm.image_url||null,description:scentForm.description||null,active:scentForm.active},scentForm.id,"Car scent saved.",()=>setScentForm({id:"",name:"",price:"0",image_url:"",description:"",active:true}))}/>
    </>} list={scents.map(x=><Row key={x.id} image={x.image_url} title={x.name} meta={`+${money(x.price)}`} active={x.active} onEdit={()=>setScentForm({id:x.id,name:x.name,price:String(x.price),image_url:x.image_url||"",description:x.description||"",active:x.active})} onDelete={()=>remove("car_fragrance_scents",x.id)}/>)}/>}

    {tab==="sizes"&&<CrudLayout title={sizeForm.id?"Edit size":"Add size"} form={<>
      <input style={input} placeholder="Label, e.g. 10 ml" value={sizeForm.label} onChange={e=>setSizeForm({...sizeForm,label:e.target.value})}/>
      <Two><input style={input} type="number" placeholder="Volume ml" value={sizeForm.volume_ml} onChange={e=>setSizeForm({...sizeForm,volume_ml:e.target.value})}/><input style={input} type="number" step="0.01" placeholder="Additional price €" value={sizeForm.price} onChange={e=>setSizeForm({...sizeForm,price:e.target.value})}/></Two>
      <Check checked={sizeForm.active} onChange={v=>setSizeForm({...sizeForm,active:v})}/>
      <Save busy={busy} onClick={()=>save("car_fragrance_sizes",{label:sizeForm.label.trim(),volume_ml:Number(sizeForm.volume_ml),price:Number(sizeForm.price),active:sizeForm.active},sizeForm.id,"Car size saved.",()=>setSizeForm({id:"",label:"10 ml",volume_ml:"10",price:"0",active:true}))}/>
    </>} list={sizes.map(x=><Row key={x.id} title={x.label} meta={`${x.volume_ml} ml · +${money(x.price)}`} active={x.active} onEdit={()=>setSizeForm({id:x.id,label:x.label,volume_ml:String(x.volume_ml),price:String(x.price),active:x.active})} onDelete={()=>remove("car_fragrance_sizes",x.id)}/>)}/>}

    {tab==="intensities"&&<CrudLayout title={intensityForm.id?"Edit intensity":"Add intensity"} form={<>
      <input style={input} placeholder="Classic / Intense" value={intensityForm.name} onChange={e=>setIntensityForm({...intensityForm,name:e.target.value})}/>
      <input style={input} type="number" step="0.01" placeholder="Price multiplier" value={intensityForm.multiplier} onChange={e=>setIntensityForm({...intensityForm,multiplier:e.target.value})}/>
      <textarea style={{...input,minHeight:90}} placeholder="Description" value={intensityForm.description} onChange={e=>setIntensityForm({...intensityForm,description:e.target.value})}/>
      <Check checked={intensityForm.active} onChange={v=>setIntensityForm({...intensityForm,active:v})}/>
      <Save busy={busy} onClick={()=>save("car_fragrance_intensities",{name:intensityForm.name.trim(),multiplier:Number(intensityForm.multiplier),description:intensityForm.description||null,active:intensityForm.active},intensityForm.id,"Intensity saved.",()=>setIntensityForm({id:"",name:"Classic",multiplier:"1",description:"",active:true}))}/>
    </>} list={intensities.map(x=><Row key={x.id} title={x.name} meta={`${x.multiplier.toFixed(2)}×`} active={x.active} onEdit={()=>setIntensityForm({id:x.id,name:x.name,multiplier:String(x.multiplier),description:x.description||"",active:x.active})} onDelete={()=>remove("car_fragrance_intensities",x.id)}/>)}/>}

    {tab==="pricing"&&<div style={{...card,marginTop:18,maxWidth:720}}>
      <h3 style={{fontSize:28,fontFamily:"Georgia,serif",fontWeight:400,marginTop:0}}>Car fragrance pricing</h3>
      <div style={{display:"grid",gap:12}}>
        <Field label="Packaging cost (€)"><input style={input} type="number" step="0.01" value={settings.packaging_cost} onChange={e=>setSettings({...settings,packaging_cost:Number(e.target.value)})}/></Field>
        <Field label="Personalised label price (€)"><input style={input} type="number" step="0.01" value={settings.personalization_price} onChange={e=>setSettings({...settings,personalization_price:Number(e.target.value)})}/></Field>
        <Field label="Profit markup (%)"><input style={input} type="number" step="0.1" value={settings.profit_markup_percent} onChange={e=>setSettings({...settings,profit_markup_percent:Number(e.target.value)})}/></Field>
        <Save busy={busy} onClick={saveSettings}/>
      </div>
    </div>}
  </section>;
}

function CrudLayout({title,form,list}:{title:string;form:ReactNode;list:ReactNode[]}){return <div style={{display:"grid",gridTemplateColumns:"minmax(290px,420px) 1fr",gap:20,marginTop:18,alignItems:"start"}}><div style={card}><h3 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:28,marginTop:0}}>{title}</h3><div style={{display:"grid",gap:12}}>{form}</div></div><div style={card}><h3 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:28,marginTop:0}}>Current items</h3><div style={{display:"grid",gap:10}}>{list.length?list:<p style={{color:"rgba(245,240,232,.6)"}}>No items yet.</p>}</div></div></div>}
function Row({image,title,meta,active,onEdit,onDelete}:{image?:string|null;title:string;meta:string;active:boolean;onEdit:()=>void;onDelete:()=>void}){return <div style={{display:"grid",gridTemplateColumns:image?"58px 1fr auto":"1fr auto",gap:12,alignItems:"center",padding:12,border:"1px solid rgba(255,255,255,.1)",borderRadius:15,background:active?"rgba(255,255,255,.025)":"rgba(255,0,0,.05)"}}>{image&&<img src={image} alt="" style={{width:58,height:58,objectFit:"cover",borderRadius:12}}/>}<div><strong>{title}</strong><div style={{color:gold,fontSize:13,marginTop:4}}>{meta}</div></div><div style={{display:"flex",gap:7}}><button style={{...button,background:"rgba(255,255,255,.07)",color:cream}} onClick={onEdit}>Edit</button><button style={{...button,background:"rgba(255,0,0,.1)",color:"#ffb3b3"}} onClick={onDelete}>Delete</button></div></div>}
function Check({checked,onChange}:{checked:boolean;onChange:(value:boolean)=>void}){return <label style={{display:"flex",gap:9,alignItems:"center",fontSize:14,color:"rgba(245,240,232,.8)"}}><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/> Visible to customers</label>}
function Save({busy,onClick}:{busy:boolean;onClick:()=>void}){return <button disabled={busy} onClick={onClick} style={{...button,background:"linear-gradient(90deg,#f4d49c,#b8873b)",color:"#111",opacity:busy?.6:1}}>{busy?"Saving...":"Save"}</button>}
function Field({label,children}:{label:string;children:ReactNode}){return <label style={{display:"grid",gap:7,color:"rgba(245,240,232,.8)",fontSize:14}}>{label}{children}</label>}
function Two({children}:{children:ReactNode}){return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{children}</div>}
function Upload({children,onChange}:{children:ReactNode;onChange:(event:ChangeEvent<HTMLInputElement>)=>void}){return <label style={{...button,display:"block",textAlign:"center",background:"rgba(215,178,122,.12)",color:gold,border:"1px solid rgba(215,178,122,.35)"}}>{children}<input type="file" accept="image/*" hidden onChange={onChange}/></label>}
