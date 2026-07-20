"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  invoice_number: string;
  customer_name: string | null;
  customer_email: string | null;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  shipping_status: string;
  created_at: string;
};

function money(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format((Number(cents) || 0) / 100);
}

export default function AdminOrdersPanel() {
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("lavie-admin-key");
    if (saved) setKey(saved);
  }, []);

  async function loadOrders(adminKey = key) {
    if (!adminKey) {
      setMessage("Enter the admin key first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/orders", {
      headers: { "x-admin-key": adminKey },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not load orders.");
      setOrders([]);
    } else {
      sessionStorage.setItem("lavie-admin-key", adminKey);
      setOrders(data.orders || []);
    }

    setLoading(false);
  }

  async function updateOrder(
    order: Order,
    orderStatus: string,
    shippingStatus: string
  ) {
    setMessage("");

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": key,
      },
      body: JSON.stringify({
        id: order.id,
        order_status: orderStatus,
        shipping_status: shippingStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Update failed.");
      return;
    }

    setOrders((current) =>
      current.map((item) => (item.id === order.id ? data.order : item))
    );
    setMessage("Order updated and customer notified.");
  }

  return (
    <section
      style={{
        marginTop: 35,
        padding: 24,
        border: "1px solid rgba(215,178,122,.3)",
        borderRadius: 22,
        background: "rgba(255,255,255,.025)",
        color: "#f5f0e8",
      }}
    >
      <h2 style={{ color: "#d7b27a", marginTop: 0 }}>Orders</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <input
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="Admin API key"
          style={{
            minWidth: 260,
            flex: 1,
            padding: 12,
            background: "#0c0c0c",
            color: "#fff",
            border: "1px solid #4b4235",
            borderRadius: 10,
          }}
        />
        <button
          onClick={() => loadOrders()}
          disabled={loading}
          style={{
            padding: "12px 18px",
            border: 0,
            borderRadius: 10,
            background: "#d7b27a",
            color: "#070707",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {loading ? "Loading…" : "Load orders"}
        </button>
      </div>

      {message && <p>{message}</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr>
              {["Date", "Order", "Customer", "Total", "Payment", "Order status", "Shipping"].map(
                (label) => (
                  <th
                    key={label}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #4b4235",
                      color: "#d7b27a",
                    }}
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #252525" }}>
                  {new Date(order.created_at).toLocaleDateString("de-DE")}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #252525" }}>
                  {order.invoice_number}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #252525" }}>
                  <strong>{order.customer_name || "—"}</strong>
                  <br />
                  <small>{order.customer_email || "—"}</small>
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #252525" }}>
                  {money(order.amount_total, order.currency)}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #252525" }}>
                  {order.payment_status}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #252525" }}>
                  <select
                    value={order.order_status}
                    onChange={(event) =>
                      updateOrder(order, event.target.value, order.shipping_status)
                    }
                  >
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #252525" }}>
                  <select
                    value={order.shipping_status}
                    onChange={(event) =>
                      updateOrder(order, order.order_status, event.target.value)
                    }
                  >
                    <option value="not_shipped">Not shipped</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
