import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server variables");
  return createClient(url, key, { auth: { persistSession: false } });
}

function money(cents: number | null | undefined, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((Number(cents) || 0) / 100);
}

function clean(value: unknown) {
  return String(value || "").replace(/[<>&"]/g, "");
}

async function createInvoicePdf(params: {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  items: Stripe.LineItem[];
}) {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const gold = rgb(0.72, 0.52, 0.24);
  const black = rgb(0.08, 0.08, 0.08);
  const gray = rgb(0.38, 0.38, 0.38);

  let y = 790;

  page.drawText("LA VIE PARFUM", {
    x: 48, y, size: 24, font: bold, color: gold,
  });

  page.drawText("INVOICE", {
    x: 448, y: y + 2, size: 15, font: bold, color: black,
  });

  y -= 42;
  page.drawText(`Invoice: ${params.invoiceNumber}`, {
    x: 48, y, size: 10, font: regular, color: gray,
  });
  page.drawText(`Date: ${new Intl.DateTimeFormat("de-DE").format(new Date())}`, {
    x: 390, y, size: 10, font: regular, color: gray,
  });

  y -= 36;
  page.drawText("Bill to", { x: 48, y, size: 11, font: bold, color: black });
  y -= 18;
  page.drawText(params.customerName || "Customer", {
    x: 48, y, size: 10, font: regular, color: black,
  });
  y -= 15;
  page.drawText(params.customerEmail || "", {
    x: 48, y, size: 10, font: regular, color: gray,
  });

  y -= 42;
  page.drawRectangle({
    x: 48, y: y - 8, width: 499, height: 26,
    color: rgb(0.96, 0.94, 0.90),
  });
  page.drawText("Product", { x: 58, y, size: 10, font: bold, color: black });
  page.drawText("Qty", { x: 390, y, size: 10, font: bold, color: black });
  page.drawText("Total", { x: 475, y, size: 10, font: bold, color: black });

  y -= 34;

  for (const item of params.items) {
    if (y < 110) {
      page = pdf.addPage([595.28, 841.89]);
      y = 790;
    }

    const title = String(item.description || "LA VIE Perfume").slice(0, 55);
    page.drawText(title, { x: 58, y, size: 10, font: regular, color: black });
    page.drawText(String(item.quantity || 1), {
      x: 398, y, size: 10, font: regular, color: black,
    });
    page.drawText(money(item.amount_total, params.currency), {
      x: 465, y, size: 10, font: regular, color: black,
    });

    y -= 25;
    page.drawLine({
      start: { x: 48, y: y + 9 },
      end: { x: 547, y: y + 9 },
      thickness: 0.5,
      color: rgb(0.86, 0.86, 0.86),
    });
  }

  y -= 15;
  page.drawText("Total", { x: 390, y, size: 12, font: bold, color: black });
  page.drawText(money(params.amountTotal, params.currency), {
    x: 465, y, size: 12, font: bold, color: gold,
  });

  page.drawText("Thank you for choosing LA VIE.", {
    x: 48, y: 65, size: 10, font: regular, color: gray,
  });
  page.drawText("lavieparfum.de", {
    x: 448, y: 65, size: 10, font: regular, color: gray,
  });

  return Buffer.from(await pdf.save());
}

function emailHtml(params: {
  customerName: string;
  invoiceNumber: string;
  amountTotal: number;
  currency: string;
  items: Stripe.LineItem[];
}) {
  const rows = params.items.map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee">${clean(item.description || "LA VIE Perfume")}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${item.quantity || 1}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right">${money(item.amount_total, params.currency)}</td>
    </tr>
  `).join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#151515;line-height:1.6">
    <div style="background:#080808;padding:28px;text-align:center">
      <div style="font-family:Georgia,serif;color:#d7b27a;font-size:30px;letter-spacing:6px">LA VIE</div>
      <div style="color:#f5f0e8;font-size:12px;letter-spacing:3px">PARFUM</div>
    </div>
    <div style="padding:30px;border:1px solid #eee">
      <h2 style="margin-top:0">Thank you for your order</h2>
      <p>Hello ${clean(params.customerName || "dear customer")},</p>
      <p>Your payment was successful. We are now preparing your order.</p>
      <p><strong>Invoice number:</strong> ${clean(params.invoiceNumber)}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px">
        <thead>
          <tr style="background:#f8f5ef">
            <th style="padding:12px;text-align:left">Product</th>
            <th style="padding:12px;text-align:center">Qty</th>
            <th style="padding:12px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <h3 style="text-align:right;color:#b8873b">
        Total: ${money(params.amountTotal, params.currency)}
      </h3>
      <p>Your PDF invoice is attached to this email.</p>
      <p style="margin-top:30px;color:#777;font-size:13px">
        LA VIE PARFUM — We craft your aromatic story.
      </p>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const stripe = getStripe();
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });

    const items = fullSession.line_items?.data || [];
    const email =
      fullSession.customer_details?.email ||
      fullSession.customer_email ||
      "";
    const customerName = fullSession.customer_details?.name || "Customer";
    const currency = (fullSession.currency || "eur").toUpperCase();
    const amountTotal = fullSession.amount_total || 0;
    const invoiceNumber = `LV-${new Date().getFullYear()}-${session.id.slice(-8).toUpperCase()}`;

    const shipping =
      fullSession.shipping_details ||
      (fullSession.collected_information as any)?.shipping_details ||
      null;

    const orderPayload = {
      stripe_session_id: fullSession.id,
      stripe_payment_intent:
        typeof fullSession.payment_intent === "string"
          ? fullSession.payment_intent
          : null,
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_email: email,
      customer_phone: fullSession.customer_details?.phone || null,
      amount_total: amountTotal,
      currency,
      payment_status: fullSession.payment_status || "paid",
      order_status: "processing",
      shipping_status: "not_shipped",
      shipping_name: shipping?.name || customerName,
      shipping_address: shipping?.address || null,
      items: items.map((item) => ({
        name: item.description,
        quantity: item.quantity || 1,
        amount_total: item.amount_total || 0,
        currency: item.currency || fullSession.currency || "eur",
      })),
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase
      .from("orders")
      .upsert(orderPayload, { onConflict: "stripe_session_id" });

    if (dbError) throw dbError;

    if (email && process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM) {
      const pdf = await createInvoicePdf({
        invoiceNumber,
        customerName,
        customerEmail: email,
        amountTotal,
        currency,
        items,
      });

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: emailError } = await resend.emails.send({
        from: process.env.ORDER_EMAIL_FROM,
        to: email,
        subject: `Your LA VIE order — ${invoiceNumber}`,
        html: emailHtml({
          customerName,
          invoiceNumber,
          amountTotal,
          currency,
          items,
        }),
        attachments: [
          {
            content: pdf.toString("base64"),
            filename: `${invoiceNumber}.pdf`,
          },
        ],
        headers: {
          "Idempotency-Key": `order-confirmation-${fullSession.id}`,
        },
      });

      if (emailError) {
        console.error("RESEND ERROR:", emailError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("STRIPE WEBHOOK ERROR:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
