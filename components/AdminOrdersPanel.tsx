
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOrders() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Please sign in to the admin dashboard."
            : "Could not load orders."
        );
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      setOrders([]);
      setMessage(
        error instanceof Error ? error.message : "Could not load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function updateOrder(
    order: Order,
    orderStatus: string,
    shippingStatus: string
  ) {
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          order_status: orderStatus,
          shipping_status: shippingStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed.");
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? data.order : item
        )
      );

      setMessage("Order updated and customer notified.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Update failed."
      );
    }
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
      <h2 style={{ color: "#d7b27a", marginTop: 0 }}>
        Orders
      </h2>

      <button
        onClick={() => void loadOrders()}
        disabled={loading}
        style={{
          padding: "12px 18px",
          marginBottom: 22,
          border: 0,
          borderRadius: 10,
          background: "#d7b27a",
          color: "#070707",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {loading ? "Loading..." : "Refresh orders"}
      </button>

      {message && <p>{message}</p>}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 900,
          }}
        >
          <thead>
            <tr>
              {[
                "Date",
                "Order",
                "Customer",
                "Total",
                "Payment",
                "Order status",
                "Shipping",
              ].map((label) => (
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
              ))}
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ padding: 12 }}>
                  {new Date(order.created_at).toLocaleDateString("de-DE")}
                </td>

                <td style={{ padding: 12 }}>
                  {order.invoice_number}
                </td>

                <td style={{ padding: 12 }}>
                  <strong>{order.customer_name || "—"}</strong>
                  <br />
                  <small>{order.customer_email || "—"}</small>
                </td>

                <td style={{ padding: 12 }}>
                  {money(order.amount_total, order.currency)}
                </td>

                <td style={{ padding: 12 }}>
                  {order.payment_status}
                </td>

                <td style={{ padding: 12 }}>
                  <select
                    value={order.order_status}
                    onChange={(event) =>
                      void updateOrder(
                        order,
                        event.target.value,
                        order.shipping_status
                      )
                    }
                  >
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td style={{ padding: 12 }}>
                  <select
                    value={order.shipping_status}
                    onChange={(event) =>
                      void updateOrder(
                        order,
                        order.order_status,
                        event.target.value
                      )
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
