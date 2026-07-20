import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = process.env.ADMIN_API_KEY;
  const received = request.headers.get("x-admin-key");
  return Boolean(expected && received && expected === received);
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server variables");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const orderStatus = String(body.order_status || "");
    const shippingStatus = String(body.shipping_status || "");

    const allowedOrder = ["processing", "completed", "cancelled"];
    const allowedShipping = ["not_shipped", "shipped", "delivered"];

    if (
      !id ||
      !allowedOrder.includes(orderStatus) ||
      !allowedShipping.includes(shippingStatus)
    ) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: order, error } = await db
      .from("orders")
      .update({
        order_status: orderStatus,
        shipping_status: shippingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    if (
      order?.customer_email &&
      process.env.RESEND_API_KEY &&
      process.env.ORDER_EMAIL_FROM
    ) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const statusText =
        shippingStatus === "shipped"
          ? "Your LA VIE order has been shipped."
          : shippingStatus === "delivered"
          ? "Your LA VIE order has been delivered."
          : orderStatus === "cancelled"
          ? "Your LA VIE order has been cancelled."
          : "Your LA VIE order status has been updated.";

      await resend.emails.send({
        from: process.env.ORDER_EMAIL_FROM,
        to: order.customer_email,
        subject: `LA VIE order update — ${order.invoice_number}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto">
            <div style="background:#080808;padding:26px;text-align:center;color:#d7b27a;font-family:Georgia,serif;font-size:28px;letter-spacing:6px">LA VIE</div>
            <div style="padding:28px;border:1px solid #eee">
              <h2>Order update</h2>
              <p>Hello ${order.customer_name || "dear customer"},</p>
              <p>${statusText}</p>
              <p><strong>Order:</strong> ${order.invoice_number}</p>
              <p><strong>Order status:</strong> ${orderStatus}</p>
              <p><strong>Shipping status:</strong> ${shippingStatus}</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
