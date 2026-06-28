export default function Footer() {
  return (
    <footer className="lavie-footer">
      <div className="footer-newsletter">
        <div className="footer-logo">LV</div>
        <h2>VERPASSEN SIE KEINE KOMMENDEN NEUIGKEITEN</h2>
        <div className="newsletter-box">
          <input placeholder="Email" />
          <button>Abonnieren</button>
        </div>
      </div>

      <div className="footer-main">
        <div>
          <h3>Wir sind für Sie da:</h3>
          <p>📞 +49 151 6456070</p>
          <p>✉️ hussine@gmail.com</p>

          <h3>Folgen Sie uns in den sozialen Medien:</h3>
          <div className="socials">
            <span>f</span>
            <span>◎</span>
            <span>♪</span>
          </div>

          <h3>Produktkategorien:</h3>
          <p>Damenparfums</p>
          <p>Herrenparfums</p>
          <p>Unisex Parfums</p>
          <p>Reiseparfums</p>
        </div>

        <div>
          <h3>Wir beraten Sie:</h3>
          <p>Duftberater</p>
          <p>Rezensionen</p>
          <p>FAQ</p>
          <p>Lexikon der Düfte</p>
          <p>Blog</p>
          <p>Kontakt</p>
        </div>

        <div>
          <h3>Das Geschäft:</h3>
          <p>Geschäftsbedingungen</p>
          <p>Zahlung und Lieferung</p>
          <p>Datenschutz</p>
          <p>Cookie-Richtlinie (EU)</p>
          <p>Rücktritt vom Vertrag</p>
        </div>
      </div>

      <div className="footer-payments">
        <h3>Wir liefern mit:</h3>
        <div className="payment-row">GLS · Hermes · DHL · DPD</div>

        <h3>Zahlungsmöglichkeiten:</h3>
        <div className="payment-row">PayPal · Stripe · Klarna · VISA · Mastercard · Apple Pay · Google Pay · Banküberweisung</div>
      </div>

      <div className="footer-bottom">
        © 2026 - Alle Rechte vorbehalten
        <br />
        Hergestellt von LA VIE.
      </div>
    </footer>
  );
}