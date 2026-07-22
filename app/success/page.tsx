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

function OrderProgress() {
  const steps = [
    {
      title: "Bestellung erhalten",
      text: "Ihre Bestellung wurde erfolgreich übermittelt.",
      active: true,
    },
    {
      title: "In Bearbeitung",
      text: "Wir bereiten Ihre Bestellung sorgfältig vor.",
      active: true,
    },
    {
      title: "Versandt",
      text: "Sie erhalten eine Nachricht, sobald das Paket versendet wurde.",
      active: false,
    },
    {
      title: "Zugestellt",
      text: "Ihre Bestellung wurde erfolgreich zugestellt.",
      active: false,
    },
  ];

  return (
    <div
      style={{
        marginTop: 34,
        padding: "24px 22px",
        borderRadius: 20,
        border: "1px solid rgba(215,178,122,.22)",
        background: "rgba(255,255,255,.025)",
      }}
    >
      <p
        style={{
          margin: "0 0 22px",
          color: "#d7b27a",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2.2,
        }}
      >
        BESTELLSTATUS
      </p>

      <div>
        {steps.map((step, index) => (
          <div
            key={step.title}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: 14,
              position: "relative",
              paddingBottom: index === steps.length - 1 ? 0 : 25,
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  marginTop: 3,
                  borderRadius: "50%",
                  display: "block",
                  position: "relative",
                  zIndex: 2,
                  background: step.active ? "#d7b27a" : "#151515",
                  border: step.active
                    ? "2px solid #d7b27a"
                    : "2px solid #575149",
                  boxShadow: step.active
                    ? "0 0 18px rgba(215,178,122,.45)"
                    : "none",
                }}
              />

              {index < steps.length - 1 && (
                <span
                  style={{
                    position: "absolute",
                    top: 18,
                    bottom: -7,
                    width: 1,
                    background: step.active
                      ? "linear-gradient(#d7b27a,rgba(215,178,122,.25))"
                      : "rgba(255,255,255,.13)",
                  }}
                />
              )}
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  color: step.active ? "#f5f0e8" : "#777067",
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                {step.title}
              </strong>

              <span
                style={{
                  color: step.active ? "#aaa298" : "#5f5a53",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                {step.text}
              </span>
            </div>
          </div>
        ))}
      </div>
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

        return result;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [sessionId]);

  if (!data && !error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "55px 0 30px",
          color: "#c8c0b5",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            margin: "0 auto 18px",
            borderRadius: "50%",
            border: "2px solid rgba(215,178,122,.2)",
            borderTopColor: "#d7b27a",
            animation: "lavieSpin 1s linear infinite",
          }}
        />

        <p>Ihre Bestellung wird geladen …</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(28px, 5vw, 42px)",
            marginBottom: 16,
          }}
        >
          Vielen Dank für Ihre Bestellung
        </h1>

        <p style={{ color: "#c0b8ad", lineHeight: 1.7 }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          width: 78,
          height: 78,
          margin: "32px auto 22px",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: "2px solid #d7b27a",
          color: "#d7b27a",
          fontSize: 36,
          boxShadow:
            "0 0 0 8px rgba(215,178,122,.035), 0 0 34px rgba(215,178,122,.15)",
        }}
      >
        ✓
      </div>

      <p
        style={{
          textAlign: "center",
          margin: 0,
          color: "#d7b27a",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: 3,
        }}
      >
        ZAHLUNG ERFOLGREICH
      </p>

      <h1
        style={{
          textAlign: "center",
          fontFamily: "Georgia, serif",
          fontSize: "clamp(30px, 5vw, 46px)",
          fontWeight: 500,
          margin: "14px 0",
        }}
      >
        Vielen Dank
        {data?.customerName ? `, ${data.customerName}` : ""}
      </h1>

      <p
        style={{
          maxWidth: 590,
          margin: "0 auto",
          color: "#c8c0b5",
          textAlign: "center",
          lineHeight: 1.75,
          fontSize: 15,
        }}
      >
        Ihre Bestellung ist erfolgreich bei uns eingegangen. Die
        Bestellbestätigung und Ihre Rechnung werden an{" "}
        <strong style={{ color: "#f5f0e8" }}>
          {data?.customerEmail || "Ihre E-Mail-Adresse"}
        </strong>{" "}
        gesendet.
      </p>

      <div
        style={{
          marginTop: 36,
          padding: "22px",
          borderRadius: 20,
          border: "1px solid rgba(215,178,122,.25)",
          background:
            "linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015))",
        }}
      >
        <p
          style={{
            margin: "0 0 15px",
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
              alignItems: "flex-start",
              gap: 20,
              padding: "15px 0",
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
                  color: "#f5f0e8",
                  marginBottom: 5,
                }}
              >
                {item.name}
              </strong>

              <span style={{ color: "#898278", fontSize: 13 }}>
                Menge: {item.quantity}
              </span>
            </div>

            <strong
              style={{
                color: "#e4c48d",
                whiteSpace: "nowrap",
              }}
            >
              {money(item.amountTotal, data.currency)}
            </strong>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            paddingTop: 21,
            marginTop: 8,
            borderTop: "1px solid rgba(215,178,122,.3)",
            color: "#d7b27a",
            fontSize: 21,
          }}
        >
          <strong>Gesamtbetrag</strong>

          <strong>
            {data && money(data.amountTotal, data.currency)}
          </strong>
        </div>
      </div>

      <OrderProgress />

      <div
        style={{
          marginTop: 24,
          padding: "17px 19px",
          borderRadius: 14,
          background: "rgba(0,0,0,.24)",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <span
          style={{
            display: "block",
            color: "#807970",
            fontSize: 11,
            marginBottom: 7,
            letterSpacing: 1.3,
          }}
        >
          BESTELLREFERENZ
        </span>

        <span
          style={{
            color: "#c2bbb1",
            fontSize: 12,
            overflowWrap: "anywhere",
          }}
        >
          {data?.id}
        </span>
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        color: "#f5f0e8",
        padding: "45px 18px",
        fontFamily: "Arial, sans-serif",
        background:
          "radial-gradient(circle at 50% 0%,#241b0d 0%,#0c0b09 27%,#030303 72%)",
      }}
    >
      <style>{`
        @keyframes lavieSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {
          .lavie-success-card {
            border-radius: 22px !important;
          }
        }
      `}</style>

      <section
        className="lavie-success-card"
        style={{
          width: "min(760px, 100%)",
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          borderRadius: 30,
          padding: "clamp(25px, 5vw, 50px)",
          border: "1px solid rgba(215,178,122,.48)",
          background:
            "linear-gradient(145deg,rgba(19,19,18,.98),rgba(5,5,5,.99))",
          boxShadow:
            "0 35px 100px rgba(0,0,0,.7), inset 0 1px rgba(255,255,255,.04)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg,transparent,#d7b27a,transparent)",
          }}
        />

        <header style={{ textAlign: "center" }}>
          <Link href="/" aria-label="Zur Startseite">
            <img
              src="/images/logo.png"
              alt="LA VIE PARFUM"
              style={{
                display: "block",
                width: "min(245px, 68vw)",
                height: 125,
                margin: "0 auto",
                objectFit: "contain",
              }}
            />
          </Link>

          <div
            style={{
              color: "#d7b27a",
              fontSize: 10,
              letterSpacing: 4.5,
              marginTop: 2,
            }}
          >
            LA VIE PARFUM · GERMANY
          </div>
        </header>

        <Suspense
          fallback={
            <p style={{ textAlign: "center", marginTop: 45 }}>
              Ihre Bestellung wird geladen …
            </p>
          }
        >
          <SuccessContent />
        </Suspense>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 36,
          }}
        >
          <Link
            href="/#collection"
            style={{
              display: "inline-block",
              padding: "15px 30px",
              borderRadius: 999,
              textDecoration: "none",
              color: "#090909",
              fontWeight: 800,
              letterSpacing: 0.4,
              background:
                "linear-gradient(135deg,#e4c58d,#b8873b)",
              boxShadow: "0 12px 35px rgba(184,135,59,.22)",
            }}
          >
            Zur Kollektion
          </Link>
        </div>

        <footer
          style={{
            marginTop: 35,
            paddingTop: 22,
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,.07)",
            color: "#706a62",
            fontSize: 11,
            lineHeight: 1.8,
          }}
        >
          LA VIE PARFUM
          <br />
          Genossenschaftsstraße 10 · 95111 Rehau · Deutschland
        </footer>
      </section>
    </main>
  );
}