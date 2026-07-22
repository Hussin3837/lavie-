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

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "55px 20px" }}>
      <div
        style={{
          width: 44,
          height: 44,
          margin: "0 auto 18px",
          borderRadius: "50%",
          border: "2px solid rgba(215,178,122,.2)",
          borderTopColor: "#d7b27a",
          animation: "lavieSpin 1s linear infinite",
        }}
      />
      <p style={{ color: "#c8c0b5" }}>
        Ihre Bestellung wird geladen …
      </p>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [data, setData] = useState<SessionData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("Es wurde keine Bestellreferenz gefunden.");
      return;
    }

    fetch(
      `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`
    )
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Die Bestellung konnte nicht geladen werden."
          );
        }

        return result as SessionData;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [sessionId]);

  if (!data && !error) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "70px 20px" }}>
        <h1
          style={{
            fontFamily: "Georgia,serif",
            marginBottom: 18,
          }}
        >
          Vielen Dank für Ihre Bestellung
        </h1>

        <p style={{ color: "#c8c0b5", lineHeight: 1.7 }}>
          {error}
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            marginTop: 28,
            padding: "14px 28px",
            border: "1px solid #d7b27a",
            color: "#d7b27a",
            textDecoration: "none",
            borderRadius: 999,
          }}
        >
          Zur Kollektion
        </Link>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0,rgba(215,178,122,.13),transparent 32%),#050505",
        color: "#f5f0e8",
        padding: "22px 14px 38px",
      }}
    >
      <section
        style={{
          width: "min(840px,100%)",
          margin: "0 auto",
          padding: "22px clamp(18px,4vw,42px) 30px",
          border: "1px solid rgba(215,178,122,.52)",
          borderRadius: 30,
          background:
            "linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012))",
          boxShadow:
            "0 30px 100px rgba(0,0,0,.65),0 0 55px rgba(215,178,122,.08)",
        }}
      >
        <header style={{ textAlign: "center" }}>
          <Link href="/" aria-label="Zur Startseite">
            <img
              src="/images/lavie-logo.png"
              alt="LA VIE PARFUM"
              style={{
                display: "block",
                width: "min(390px,86vw)",
                height: 220,
                objectFit: "contain",
                margin: "-24px auto -24px",
                filter:
                  "drop-shadow(0 0 25px rgba(215,178,122,.28))",
              }}
            />
          </Link>

          <div
            style={{
              width: 66,
              height: 66,
              margin: "0 auto 12px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              border: "2px solid #d7b27a",
              color: "#d7b27a",
              fontSize: 31,
              boxShadow: "0 0 28px rgba(215,178,122,.18)",
            }}
          >
            ✓
          </div>

          <p
            style={{
              margin: 0,
              color: "#d7b27a",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 3,
            }}
          >
            ZAHLUNG ERFOLGREICH
          </p>

          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontSize: "clamp(30px,5vw,47px)",
              fontWeight: 500,
              margin: "12px 0 10px",
            }}
          >
            Vielen Dank
            {data?.customerName ? `, ${data.customerName}` : ""}
          </h1>

          <p
            style={{
              maxWidth: 600,
              margin: "0 auto",
              color: "#c8c0b5",
              lineHeight: 1.65,
              fontSize: 14,
            }}
          >
            Ihre Bestellung ist erfolgreich eingegangen. Die
            Bestellbestätigung und Rechnung werden an{" "}
            <strong style={{ color: "#f5f0e8" }}>
              {data?.customerEmail}
            </strong>{" "}
            gesendet.
          </p>
        </header>

        <div
          style={{
            marginTop: 25,
            padding: "18px 21px",
            borderRadius: 18,
            border: "1px solid rgba(215,178,122,.28)",
            background: "rgba(255,255,255,.025)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#d7b27a",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2.2,
            }}
          >
            BESTELLÜBERSICHT
          </p>

          {data?.items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 18,
                padding: "12px 0",
                borderBottom:
                  index < data.items.length - 1
                    ? "1px solid rgba(255,255,255,.08)"
                    : "none",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  {item.name}
                </strong>

                <span style={{ color: "#90887e", fontSize: 13 }}>
                  Menge: {item.quantity}
                </span>
              </div>

              <strong style={{ color: "#e4c48d" }}>
                {money(item.amountTotal, data.currency)}
              </strong>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              paddingTop: 15,
              marginTop: 5,
              borderTop: "1px solid rgba(215,178,122,.32)",
              color: "#d7b27a",
              fontSize: 20,
            }}
          >
            <strong>Gesamtbetrag</strong>
            <strong>
              {data && money(data.amountTotal, data.currency)}
            </strong>
          </div>
        </div>

        <div
          className="lavie-success-progress"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 17,
          }}
        >
          <div
            style={{
              padding: 15,
              borderRadius: 15,
              border: "1px solid rgba(215,178,122,.24)",
              background: "rgba(215,178,122,.06)",
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>
              ✓ Bestellung erhalten
            </strong>
            <span style={{ color: "#aaa298", fontSize: 12 }}>
              Ihre Zahlung wurde bestätigt.
            </span>
          </div>

          <div
            style={{
              padding: 15,
              borderRadius: 15,
              border: "1px solid rgba(215,178,122,.24)",
              background: "rgba(215,178,122,.06)",
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>
              ◈ In Bearbeitung
            </strong>
            <span style={{ color: "#aaa298", fontSize: 12 }}>
              Wir bereiten Ihre Bestellung vor.
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 23 }}>
          <Link
            href="/#collection"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              minWidth: 230,
              padding: "14px 28px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg,#f1d595,#b68c4f,#e4bd74)",
              color: "#090705",
              textDecoration: "none",
              fontWeight: 800,
              letterSpacing: 1.3,
              boxShadow: "0 0 28px rgba(215,178,122,.2)",
            }}
          >
            Zur Kollektion
          </Link>
        </div>

        <footer
          style={{
            marginTop: 22,
            paddingTop: 17,
            borderTop: "1px solid rgba(255,255,255,.08)",
            textAlign: "center",
            color: "#827b72",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          LA VIE PARFUM · Mozart Straße 2 · 92318 Neumarkt i.d. OPf.
          <br />
          orders@lavieparfum.de · www.lavieparfum.de
        </footer>
      </section>

      <style jsx global>{`
        @keyframes lavieSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {
          .lavie-success-progress {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#050505",
            color: "#f5f0e8",
          }}
        >
          <LoadingState />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
