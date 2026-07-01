import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function money(cents: number | null | undefined, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((Number(cents) || 0) / 100);
}

function invoiceHtml(params: {
  invoiceNumber: string;
  customerName: string;
  amountTotal: number;
  currency: string;
  items: any[];
}) {
  const rows = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${item.description || "LA VIE Perfume"}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity || 1}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${money(item.amount_total, params.currency)}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;color:#111;line-height:1.6;max-width:680px;margin:auto;">
    <h1 style="font-family:Georgia,serif;color:#b8873b;">LA VIE</h1>
    <h2>Thank you for your order</h2>
    <p>Hello ${params.customerName || "dear customer"},</p>
    <p>Your payment was completed successfully. Your invoice details are below.</p>
    <p><strong>Invoice:</strong> ${params.invoiceNumber}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:18px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d7b27a;">Product</th>
          <th style="text-align:center;padding:10px;border-bottom:2px solid #d7b27a;">Qty</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #d7b27a;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <h3 style="text-align:right;margin-top:18px;">Total: ${money(params.amountTotal, params.currency)}</h3>
    <p style="margin-top:24px;">We are preparing your order now.</p>
    <p style="color:#777;font-size:13px;">LA VIE — We craft your Aromatic story.</p>
  </div>`;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = Buffer.from(await request.arrayBuffer());
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const items = lineItems.data.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amount_subtotal: item.amount_subtotal,
      amount_total: item.amount_total,
      currency: item.currency,
    }));

    const customerEmail = session.customer_details?.email || session.customer_email || "";
    const customerName = session.customer_details?.name || "";
    const invoiceNumber = `LV-${new Date().getFullYear()}-${session.id.slice(-8).toUpperCase()}`;

    const { error } = await supabaseAdmin.from("orders").upsert(
      {
        stripe_session_id: session.id,
        payment_status: session.payment_status,
        order_status: "paid",
        customer_email: customerEmail,
        customer_name: customerName,
        amount_total: session.amount_total,
        currency: session.currency || "eur",
        invoice_number: invoiceNumber,
        items,
        shipping_address: session.customer_details?.address || null,
        raw_session: session as any,
      },
      { onConflict: "stripe_session_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (customerEmail) {
      await resend.emails.send({
        from: process.env.ORDER_EMAIL_FROM || "LA VIE <orders@yourdomain.com>",
        to: customerEmail,
        subject: `Your LA VIE invoice ${invoiceNumber}`,
        html: invoiceHtml({
          invoiceNumber,
          customerName,
          amountTotal: session.amount_total || 0,
          currency: session.currency || "eur",
          items,
        }),
      });
    }
  }

  return NextResponse.json({ received: true });
}
