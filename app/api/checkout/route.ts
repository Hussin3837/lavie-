import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type CheckoutItem = { id?: string | number; quantity?: number };

function siteOrigin() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.lavieparfum.de").trim().replace(/^['"]|['"]$/g, "");
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid site URL');
  return url.origin;
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) throw new Error("Server database configuration is missing");
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const body = await req.json();
    const items: CheckoutItem[] = body?.items;
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    const quantities = new Map<string, number>();
    for (const item of items) {
      const id = String(item?.id ?? '').trim();
      const qty = Number(item?.quantity ?? 1);
      if (!id || !Number.isSafeInteger(qty) || qty < 1 || qty > 20) {
        return NextResponse.json({ error: "Invalid item or quantity" }, { status: 400 });
      }
      quantities.set(id, (quantities.get(id) ?? 0) + qty);
      if (quantities.get(id)! > 20) return NextResponse.json({ error: "Quantity limit exceeded" }, { status: 400 });
    }

    const ids = [...quantities.keys()];
    const { data: products, error } = await db
      .from('products')
      .select('id,name,price,description,image_url,active')
      .in('id', ids)
      .eq('active', true);
    if (error) throw error;
    if (!products || products.length !== ids.length) {
      return NextResponse.json({ error: "A product is unavailable" }, { status: 400 });
    }

    const origin = siteOrigin();
    const lineItems = products.map((product) => {
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0 || !product.name) throw new Error('Invalid catalog price');
      const image = product.image_url ? new URL(String(product.image_url), origin) : null;
      const images = image && ['https:', 'http:'].includes(image.protocol) ? [image.toString()] : [];
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: String(product.name),
            ...(product.description ? { description: String(product.description).slice(0, 500) } : {}),
            ...(images.length ? { images } : {}),
            metadata: { product_id: String(product.id), brand: 'LA VIE PARFUM' },
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: quantities.get(String(product.id))!,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['DE'] },
      line_items: lineItems,
      locale: 'auto',
      metadata: { store: 'LA VIE PARFUM' },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });
    if (!session.url) throw new Error('No checkout URL returned');
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('CHECKOUT ERROR:', error);
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}
