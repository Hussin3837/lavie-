import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    return NextResponse.json({
      id: session.id,
      paymentStatus: session.payment_status,
      customerName: session.customer_details?.name || "",
      customerEmail:
        session.customer_details?.email || session.customer_email || "",
      amountTotal: session.amount_total || 0,
      currency: session.currency || "eur",
      items: (session.line_items?.data || []).map((item) => ({
        name: item.description,
        quantity: item.quantity || 1,
        amountTotal: item.amount_total || 0,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
