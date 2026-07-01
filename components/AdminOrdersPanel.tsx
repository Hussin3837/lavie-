"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type OrderStatus = "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

type Order = {
  id: string;
  created_at: string;
  stripe_session_id: string | null;
  order_status: OrderStatus;
  payment_status: string | null;
  customer_email: string | null;
  customer_name: string | null;
  amount_total: number | null;
  currency: string | null;
  invoice_number: string | null;
  items: any[] | null;
};

const gold = "#d7b27a";
const cream = "#f5f0e8";

const statusLabels: Record<OrderStatus, string> = {
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function formatMoney(cents: number | null, currency = "eur") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: (currency || "eur").toUpperCase(),
  }).format((Number(cents) || 0) / 100);
}

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setOrders([]);
    } else {
      setOrders((data || []) as Order[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Order status updated successfully.");
    await loadOrders();
  }

  const totals = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + (Number(order.amount_total) || 0), 0);
    return { count: orders.length, revenue };
  }, [orders]);

  return (
    <section
      style={{
        marginTop: "28px",
        border: "1px solid rgba(215,178,122,.26)",
        background: "linear-gradient(180deg, rgba(255,255,255,.045), rgba(0,0,0,.25))",
        boxShadow: "0 24px 80px rgba(0,0,0,.22)",
        borderRadius: "22px",
        padding: "26px",
        color: cream,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "30px", margin: 0, fontFamily: "Georgia, serif", fontWeight: 400 }}>Orders</h2>
          <p style={{ color: "rgba(245,240,232,.62)", marginTop: "8px", fontSize: "14px" }}>
            {totals.count} orders • Total revenue {formatMoney(totals.revenue)}
          </p>
        </div>

        <button
          onClick={loadOrders}
          style={{
            border: "1px solid rgba(215,178,122,.45)",
            background: "transparent",
            color: gold,
            padding: "12px 18px",
            fontWeight: 800,
            cursor: "pointer",
            borderRadius: "999px",
          }}
        >
          Refresh Orders
        </button>
      </div>

      {(message || error) && (
        <div
          style={{
            padding: "14px 16px",
            marginBottom: "18px",
            borderRadius: "14px",
            color: error ? "#ffb3b3" : "#b6ffd0",
            background: error ? "rgba(255,0,0,.08)" : "rgba(0,255,100,.06)",
            border: `1px solid ${error ? "rgba(255,90,90,.5)" : "rgba(120,255,170,.45)"}`,
          }}
        >
          {error || message}
        </div>
      )}

      {loading ? (
        <p style={{ color: "rgba(245,240,232,.7)" }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: "rgba(245,240,232,.7)" }}>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(260px, 1fr) 170px 190px",
                gap: "16px",
                alignItems: "center",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: "18px",
                padding: "14px",
                background: "rgba(255,255,255,.025)",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "17px" }}>
                  {order.invoice_number || order.stripe_session_id || order.id.slice(0, 8)}
                </strong>
                <small style={{ color: gold }}>
                  {new Date(order.created_at).toLocaleString("de-DE")} • {formatMoney(order.amount_total, order.currency || "eur")}
                </small>
                <p style={{ margin: "8px 0 0", color: "rgba(245,240,232,.68)", fontSize: "13px" }}>
                  {order.customer_name || "Customer"} — {order.customer_email || "No email"}
                </p>
                <p style={{ margin: "8px 0 0", color: "rgba(245,240,232,.52)", fontSize: "12px" }}>
                  {(order.items || [])
                    .map((item: any) => `${item.quantity || 1}× ${item.description || item.name || "Product"}`)
                    .join(" • ") || "No item details"}
                </p>
              </div>

              <span
                style={{
                  justifySelf: "start",
                  fontSize: "12px",
                  color: "#b6ffd0",
                  border: "1px solid rgba(120,255,170,.35)",
                  padding: "7px 10px",
                  borderRadius: "999px",
                }}
              >
                {statusLabels[order.order_status] || order.order_status}
              </span>

              <select
                value={order.order_status}
                onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,.045)",
                  color: cream,
                  border: "1px solid rgba(215,178,122,.26)",
                  padding: "12px 14px",
                  outline: "none",
                  borderRadius: "12px",
                }}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
