import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";

function getSiteUrl() {
  const rawValue = process.env.NEXT_PUBLIC_SITE_URL
    ?.trim()
    .replace(/^['"]|['"]$/g, "");

  const value = rawValue || "https://www.lavieparfum.de";
  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;

  return new URL(withProtocol).origin;
}

function getValidImageUrl(item: any, siteUrl: string) {
  const rawImage =
    item.image_url ||
    item.imageUrl ||
    item.image ||
    item.mainImage ||
    "";

  if (typeof rawImage !== "string" || !rawImage.trim()) {
    return undefined;
  }

  try {
    const imageUrl = new URL(rawImage.trim(), siteUrl);

    if (imageUrl.protocol !== "https:" && imageUrl.protocol !== "http:") {
      return undefined;
    }

    return imageUrl.toString();
  } catch {
    return undefined;
  }
}

function getProductDescription(item: any) {
  const rawDescription =
    item.short_description ||
    item.shortDescription ||
    item.description ||
    "";

  if (typeof rawDescription !== "string") {
    return undefined;
  }

  const description = rawDescription.trim();

  if (!description) {
    return undefined;
  }

  // Stripe Checkout product descriptions should stay concise.
  return description.slice(0, 500);
}

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No checkout items were provided." },
        { status: 400 }
      );
    }

    const siteUrl = getSiteUrl();

    const lineItems = items.map((item: any) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity || 1);
      const imageUrl = getValidImageUrl(item, siteUrl);
      const description = getProductDescription(item);

      if (!item.name || !Number.isFinite(price) || price <= 0) {
        throw new Error("Invalid product data in checkout request.");
      }

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: String(item.name).trim(),
            ...(description ? { description } : {}),
            ...(imageUrl ? { images: [imageUrl] } : {}),
            metadata: {
              product_id: String(item.id || item.slug || ""),
              brand: "LA VIE PARFUM",
            },
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: Number.isFinite(quantity) && quantity > 0
          ? Math.floor(quantity)
          : 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ["DE"],
      },

      line_items: lineItems,

      locale: "auto",

      metadata: {
        store: "LA VIE PARFUM",
      },

      success_url: new URL(
        "/success?session_id={CHECKOUT_SESSION_ID}",
        siteUrl
      ).toString(),

      cancel_url: new URL("/cancel", siteUrl).toString(),
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
