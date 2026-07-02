import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["DE"] },

      line_items: items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity || 1),
      })),

      success_url: process.env.NEXT_PUBLIC_SITE_URL + "/success",
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL + "/cart",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}