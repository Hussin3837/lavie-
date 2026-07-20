"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type SessionData = {
  id: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    amountTotal: number;
  }>;
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [data, setData] = useState<SessionData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No order reference was found.");
      return;
    }

    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load order.");
        }

        return result;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [sessionId]);

  return (
    <>
      {!data && !error && (
        <p style={{ textAlign: "center", marginTop: 36 }}>
          Loading your order…
        </p>
      )}

      {error && (
        <>
          <h1 style={{ textAlign: "center", marginTop: 36 }}>
            Thank you for your order
          </h1>
          <p style={{ textAlign: "center", color: "#d8d1c6" }}>{error}</p>
        </>
      )}

      {data && (
        <>
          <div
            style={{
              width: 70,
              height: 70,
              margin: "32px auto 20px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              border: "2px solid #d7b27a",
              color: "#d7b27a",
              fontSize: 34,
            }}
          >
            ✓
          </div>

          <h1 style={{ textAlign: "center", fontFamily: "Georgia, serif" }}>
            Thank you{data.customerName ? `, ${data.customerName}` : ""}
          </h1>

          <p style={{ textAlign: "center", color: "#c9c2b8" }}>
            Your payment was successful. A confirmation and PDF invoice will be
            sent to {data.customerEmail || "your email address"}.
          </p>

          <div
            style={{
              marginTop: 32,
              borderTop: "1px solid rgba(215,178,122,.25)",
              borderBottom: "1px solid rgba(215,178,122,.25)",
              padding: "20px 0",
            }}
          >
            {data.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                  marginBottom: 12,
                }}
              >
                <span>
                  {item.name} × {item.quantity}
                </span>

                <strong>{money(item.amountTotal, data.currency)}</strong>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 20,
                fontSize: 20,
                color: "#d7b27a",
              }}
            >
              <strong>Total</strong>
              <strong>{money(data.amountTotal, data.currency)}</strong>
            </div>
          </div>

          <p
            style={{
              marginTop: 22,
              color: "#9f978b",
              fontSize: 13,
              overflowWrap: "anywhere",
            }}
          >
            Order reference: {data.id}
          </p>
        </>
      )}
    </>
  );
}

export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#f5f0e8",
        padding: "60px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "min(720px, 100%)",
          margin: "0 auto",
          border: "1px solid rgba(215,178,122,.45)",
          borderRadius: 28,
          padding: "clamp(25px, 5vw, 48px)",
          background: "linear-gradient(145deg,#111,#070707)",
          boxShadow: "0 30px 80px rgba(0,0,0,.55)",
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            color: "#d7b27a",
            letterSpacing: 7,
            fontSize: 30,
            textAlign: "center",
          }}
        >
          LA VIE
        </div>

        <Suspense
          fallback={
            <p style={{ textAlign: "center", marginTop: 36 }}>
              Loading your order…
            </p>
          }
        >
          <SuccessContent />
        </Suspense>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#d7b27a",
              color: "#080808",
              padding: "14px 24px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Return to LA VIE
          </Link>
        </div>
      </section>
    </main>
  );
}
