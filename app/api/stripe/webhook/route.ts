import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   Server clients
========================================================= */

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(key);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server variables");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/* =========================================================
   Helpers
========================================================= */

function money(
  cents: number | null | undefined,
  currency = "EUR"
) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((Number(cents) || 0) / 100);
}

function cleanHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanPdfText(value: unknown) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCompanyDetails() {
  return {
    name: process.env.COMPANY_NAME || "LA VIE PARFUM",
    address: process.env.COMPANY_ADDRESS || "Mozart Straße 2",
    postcode: process.env.COMPANY_POSTCODE || "92318",
    city: process.env.COMPANY_CITY || "Neumarkt i.d. OPf.",
    country: process.env.COMPANY_COUNTRY || "Deutschland",
    taxNumber: process.env.COMPANY_TAX_NUMBER || "",
    website:
      process.env.COMPANY_WEBSITE || "www.lavieparfum.de",
    email:
      process.env.COMPANY_EMAIL || "orders@lavieparfum.de",
  };
}

async function loadLogoBytes() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "https://www.lavieparfum.de";

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/images/lavie-logo.png`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error("Invoice logo request failed:", response.status);
      return null;
    }

    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    console.error("Could not load invoice logo:", error);
    return null;
  }
}

/* =========================================================
   PDF invoice
========================================================= */

async function createInvoicePdf(params: {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingName: string;
  shippingAddress: Stripe.Address | null;
  amountTotal: number;
  currency: string;
  items: Stripe.LineItem[];
}) {
  const company = getCompanyDetails();

  const pdf = await PDFDocument.create();

  const logoBytes = await loadLogoBytes();
  const logoImage = logoBytes
    ? await pdf.embedPng(logoBytes).catch((error) => {
        console.error("Could not embed invoice logo:", error);
        return null;
      })
    : null;

  let page = pdf.addPage([595.28, 841.89]);

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const gold = rgb(0.72, 0.52, 0.24);
  const black = rgb(0.08, 0.08, 0.08);
  const gray = rgb(0.38, 0.38, 0.38);
  const lightGray = rgb(0.86, 0.86, 0.86);
  const cream = rgb(0.96, 0.94, 0.9);

  const drawPageHeader = () => {
    page.drawRectangle({
      x: 0,
      y: 730,
      width: 595.28,
      height: 111.89,
      color: black,
    });

    if (logoImage) {
      const original = logoImage.scale(1);
      const targetHeight = 91;
      const targetWidth =
        original.width * (targetHeight / original.height);

      page.drawImage(logoImage, {
        x: 48,
        y: 742,
        width: targetWidth,
        height: targetHeight,
      });
    } else {
      page.drawText("LA VIE PARFUM", {
        x: 48,
        y: 785,
        size: 22,
        font: bold,
        color: gold,
      });
    }

    page.drawText("RECHNUNG", {
      x: 435,
      y: 790,
      size: 15,
      font: bold,
      color: gold,
    });

    page.drawText("LUXURY PARFUM · GERMANY", {
      x: 382,
      y: 767,
      size: 7.5,
      font: regular,
      color: cream,
    });

    page.drawLine({
      start: { x: 48, y: 730 },
      end: { x: 547, y: 730 },
      thickness: 1.2,
      color: gold,
    });
  };

  drawPageHeader();

  let y = 705;

  page.drawText(`Rechnungsnummer: ${params.invoiceNumber}`, {
    x: 48,
    y,
    size: 10,
    font: regular,
    color: gray,
  });

  page.drawText(`Bestellnummer: ${params.orderNumber}`, {
    x: 48,
    y: y - 16,
    size: 10,
    font: regular,
    color: gray,
  });

  page.drawText(
    `Rechnungsdatum: ${new Intl.DateTimeFormat("de-DE").format(new Date())}`,
    {
      x: 372,
      y,
      size: 10,
      font: regular,
      color: gray,
    }
  );

  y -= 58;

  page.drawText("Verkäufer", {
    x: 48,
    y,
    size: 11,
    font: bold,
    color: black,
  });

  page.drawText("Rechnungsempfänger", {
    x: 315,
    y,
    size: 11,
    font: bold,
    color: black,
  });

  y -= 18;

  const companyLines = [
    company.name,
    company.address,
    `${company.postcode} ${company.city}`.trim(),
    company.country,
    company.email,
    company.website,
    company.taxNumber
      ? `Steuernummer: ${company.taxNumber}`
      : "",
  ].filter(Boolean);

  const customerAddress = params.shippingAddress;

  const customerLines = [
    params.shippingName || params.customerName || "Kunde",
    customerAddress?.line1 || "",
    customerAddress?.line2 || "",
    `${customerAddress?.postal_code || ""} ${
      customerAddress?.city || ""
    }`.trim(),
    customerAddress?.country || "",
    params.customerEmail,
  ].filter(Boolean);

  companyLines.forEach((line, index) => {
    page.drawText(cleanPdfText(line).slice(0, 48), {
      x: 48,
      y: y - index * 15,
      size: 9.5,
      font: regular,
      color: index === 0 ? black : gray,
    });
  });

  customerLines.forEach((line, index) => {
    page.drawText(cleanPdfText(line).slice(0, 48), {
      x: 315,
      y: y - index * 15,
      size: 9.5,
      font: regular,
      color: index === 0 ? black : gray,
    });
  });

  y -= Math.max(companyLines.length, customerLines.length) * 15 + 30;

  page.drawRectangle({
    x: 48,
    y: y - 8,
    width: 499,
    height: 27,
    color: cream,
  });

  page.drawText("Produkt", {
    x: 58,
    y,
    size: 10,
    font: bold,
    color: black,
  });

  page.drawText("Menge", {
    x: 385,
    y,
    size: 10,
    font: bold,
    color: black,
  });

  page.drawText("Gesamt", {
    x: 475,
    y,
    size: 10,
    font: bold,
    color: black,
  });

  y -= 35;

  for (const item of params.items) {
    if (y < 155) {
      page = pdf.addPage([595.28, 841.89]);
      drawPageHeader();
      y = 735;
    }

    const productName = cleanPdfText(
      item.description || "LA VIE Parfum"
    ).slice(0, 52);

    page.drawText(productName, {
      x: 58,
      y,
      size: 10,
      font: regular,
      color: black,
    });

    page.drawText(String(item.quantity || 1), {
      x: 400,
      y,
      size: 10,
      font: regular,
      color: black,
    });

    page.drawText(money(item.amount_total, params.currency), {
      x: 465,
      y,
      size: 10,
      font: regular,
      color: black,
    });

    y -= 25;

    page.drawLine({
      start: { x: 48, y: y + 9 },
      end: { x: 547, y: y + 9 },
      thickness: 0.5,
      color: lightGray,
    });
  }

  y -= 15;

  page.drawText("Gesamtbetrag", {
    x: 365,
    y,
    size: 12,
    font: bold,
    color: black,
  });

  page.drawText(money(params.amountTotal, params.currency), {
    x: 465,
    y,
    size: 12,
    font: bold,
    color: gold,
  });

  y -= 42;

  page.drawText(
    "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet",
    {
      x: 48,
      y,
      size: 9.5,
      font: regular,
      color: gray,
    }
  );

  page.drawText("(Kleinunternehmerregelung).", {
    x: 48,
    y: y - 15,
    size: 9.5,
    font: regular,
    color: gray,
  });

  page.drawText("Vielen Dank für Ihre Bestellung bei LA VIE PARFUM.", {
    x: 48,
    y: 65,
    size: 9.5,
    font: regular,
    color: gray,
  });

  page.drawText(company.website, {
    x: 430,
    y: 65,
    size: 9.5,
    font: regular,
    color: gray,
  });

  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
}

/* =========================================================
   German confirmation email
========================================================= */

function emailHtml(params: {
  customerName: string;
  orderNumber: string;
  invoiceNumber: string;
  amountTotal: number;
  currency: string;
  items: Stripe.LineItem[];
}) {
  const rows = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #ece7dd;">
            ${cleanHtml(item.description || "LA VIE Parfum")}
          </td>

          <td style="padding:14px 12px;border-bottom:1px solid #ece7dd;text-align:center;">
            ${item.quantity || 1}
          </td>

          <td style="padding:14px 12px;border-bottom:1px solid #ece7dd;text-align:right;white-space:nowrap;">
            ${money(item.amount_total, params.currency)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bestellbestätigung</title>
      </head>

      <body style="margin:0;padding:0;background:#f4f1eb;font-family:Arial,Helvetica,sans-serif;color:#151515;">
        <div style="padding:30px 12px;">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;box-shadow:0 10px 35px rgba(0,0,0,0.08);">

            <div style="background:#080808;padding:34px 20px;text-align:center;">
              <img
                src="https://www.lavieparfum.de/images/lavie-logo.png"
                width="260"
                alt="LA VIE PARFUM"
                style="display:block;width:260px;max-width:82%;height:auto;margin:0 auto;"
              />
            </div>

            <div style="padding:34px 30px;border:1px solid #ece7dd;border-top:none;">
              <h1 style="font-family:Georgia,serif;font-size:25px;margin:0 0 22px;color:#151515;">
                Vielen Dank für Ihre Bestellung
              </h1>

              <p style="margin:0 0 16px;">
                Guten Tag ${cleanHtml(
                  params.customerName || "lieber Kunde"
                )},
              </p>

              <p style="margin:0 0 22px;">
                Ihre Zahlung war erfolgreich. Wir bereiten Ihre Bestellung jetzt sorgfältig für den Versand vor.
              </p>

              <div style="background:#f8f5ef;border-left:4px solid #d7b27a;padding:16px 18px;margin:22px 0;">
                <div style="margin-bottom:7px;">
                  <strong>Bestellnummer:</strong>
                  ${cleanHtml(params.orderNumber)}
                </div>

                <div>
                  <strong>Rechnungsnummer:</strong>
                  ${cleanHtml(params.invoiceNumber)}
                </div>
              </div>

              <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:24px;font-size:14px;">
                <thead>
                  <tr style="background:#f8f5ef;">
                    <th style="padding:13px 12px;text-align:left;">Produkt</th>
                    <th style="padding:13px 12px;text-align:center;">Menge</th>
                    <th style="padding:13px 12px;text-align:right;">Gesamt</th>
                  </tr>
                </thead>

                <tbody>
                  ${rows}
                </tbody>
              </table>

              <div style="text-align:right;font-family:Georgia,serif;font-size:20px;color:#b8873b;margin-top:22px;">
                Gesamtbetrag:
                <strong>${money(
                  params.amountTotal,
                  params.currency
                )}</strong>
              </div>

              <p style="margin-top:30px;">
                Ihre Rechnung im PDF-Format befindet sich im Anhang dieser E-Mail.
              </p>

              <p style="font-size:12px;color:#777;margin-top:26px;">
                Gemäß § 19 UStG wird keine Umsatzsteuer berechnet
                (Kleinunternehmerregelung).
              </p>

              <p style="margin-top:32px;">
                Mit freundlichen Grüßen<br />
                <strong>Ihr LA VIE PARFUM Team</strong>
              </p>

              <div style="border-top:1px solid #ece7dd;margin-top:32px;padding-top:20px;color:#777;font-size:12px;line-height:1.7;text-align:center;">
                <strong style="color:#151515;">LA VIE PARFUM</strong><br />
                Mozart Straße 2 · 92318 Neumarkt i.d. OPf. · Deutschland<br />
                orders@lavieparfum.de · www.lavieparfum.de
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/* =========================================================
   Stripe webhook
========================================================= */

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const rawBody = await request.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const fullSession = await stripe.checkout.sessions.retrieve(
      session.id,
      {
        expand: ["line_items"],
      }
    );

    const fullSessionData = fullSession as Stripe.Checkout.Session & {
      shipping_details?: {
        name?: string | null;
        address?: Stripe.Address | null;
      } | null;

      collected_information?: {
        shipping_details?: {
          name?: string | null;
          address?: Stripe.Address | null;
        } | null;
      } | null;
    };

    const items = fullSession.line_items?.data || [];

    const customerEmail =
      fullSession.customer_details?.email ||
      fullSession.customer_email ||
      "";

    const customerName =
      fullSession.customer_details?.name ||
      "Kunde";

    const currency =
      (fullSession.currency || "eur").toUpperCase();

    const amountTotal =
      fullSession.amount_total || 0;

    const shipping =
      fullSessionData.shipping_details ||
      fullSessionData.collected_information?.shipping_details ||
      null;

    const supabase = getSupabaseAdmin();

    /*
      Check whether this Stripe session was already saved.
      This protects the order from duplicated webhook events.
    */

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabase
      .from("orders")
      .select("order_number, invoice_number")
      .eq("stripe_session_id", fullSession.id)
      .maybeSingle();

    if (existingOrderError) {
      throw existingOrderError;
    }

    let orderNumber =
      existingOrder?.order_number ||
      existingOrder?.invoice_number ||
      "";

    /*
      Generate a new sequential number only when this order
      does not already have one.
    */

    if (!orderNumber) {
      const {
        data: generatedOrderNumber,
        error: orderNumberError,
      } = await supabase.rpc("next_lavie_order_number");

      if (orderNumberError) {
        throw orderNumberError;
      }

      if (
        typeof generatedOrderNumber !== "string" ||
        !generatedOrderNumber.trim()
      ) {
        throw new Error(
          "Could not generate the LA VIE order number."
        );
      }

      orderNumber = generatedOrderNumber.trim();
    }

    const invoiceNumber = orderNumber;

    /*
      The payload must be created after orderNumber and
      invoiceNumber have been generated.
    */

    const orderPayload = {
      stripe_session_id: fullSession.id,

      stripe_payment_intent:
        typeof fullSession.payment_intent === "string"
          ? fullSession.payment_intent
          : null,

      order_number: orderNumber,
      invoice_number: invoiceNumber,

      customer_name: customerName,
      customer_email: customerEmail,

      customer_phone:
        fullSession.customer_details?.phone || null,

      amount_total: amountTotal,
      currency,

      payment_status:
        fullSession.payment_status || "paid",

      order_status: "processing",
      shipping_status: "not_shipped",

      shipping_name:
        shipping?.name || customerName,

      shipping_address:
        shipping?.address || null,

      items: items.map((item) => ({
        name:
          item.description || "LA VIE Parfum",

        quantity:
          item.quantity || 1,

        amount_total:
          item.amount_total || 0,

        currency:
          item.currency ||
          fullSession.currency ||
          "eur",
      })),

      updated_at: new Date().toISOString(),
    };

    const { error: databaseError } = await supabase
      .from("orders")
      .upsert(orderPayload, {
        onConflict: "stripe_session_id",
      });

    if (databaseError) {
      throw databaseError;
    }

    /*
      Send the confirmation email only when all required
      email variables are configured.
    */

    if (
      customerEmail &&
      process.env.RESEND_API_KEY &&
      process.env.ORDER_EMAIL_FROM
    ) {
      const invoicePdf = await createInvoicePdf({
        invoiceNumber,
        orderNumber,
        customerName,
        customerEmail,

        shippingName:
          shipping?.name || customerName,

        shippingAddress:
          shipping?.address || null,

        amountTotal,
        currency,
        items,
      });

      const resend = new Resend(
        process.env.RESEND_API_KEY
      );

      const { error: emailError } =
        await resend.emails.send(
          {
            from:
  process.env.ORDER_EMAIL_FROM ||
  "LA VIE PARFUM <orders@lavieparfum.de>",
            to: [customerEmail],
            replyTo: "orders@lavieparfum.de",

            subject:
              `Bestellbestätigung ${orderNumber} – LA VIE PARFUM`,

            html: emailHtml({
              customerName,
              orderNumber,
              invoiceNumber,
              amountTotal,
              currency,
              items,
            }),

            attachments: [
              {
                content:
                  invoicePdf.toString("base64"),

                filename:
                  `Rechnung-${invoiceNumber}.pdf`,
              },
            ],
          },
          {
            idempotencyKey:
              `order-confirmation/${fullSession.id}`,
          }
        );

      if (emailError) {
        console.error(
          "RESEND EMAIL ERROR:",
          emailError
        );
      }
    } else {
      console.warn(
        "Order email was not sent because the customer email or Resend environment variables are missing."
      );
    }

    return NextResponse.json({
      received: true,
      orderNumber,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Webhook processing failed.",
        message,
      },
      {
        status: 400,
      }
    );
  }
}