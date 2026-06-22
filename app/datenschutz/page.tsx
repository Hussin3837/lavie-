export default function DatenschutzPage() {
  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "60px 20px",
        color: "#fff",
        background: "#000",
        minHeight: "100vh",
        lineHeight: "1.8",
      }}
    >
      <h1>Datenschutzerklärung</h1>

      <h2>1. Verantwortlicher</h2>

      <p>
        La Vie Parfum
        <br />
        Inhaber: Hussin Abd Hussin
        <br />
        Mozartstraße 2
        <br />
        92318 Neumarkt i.d.OPf.
        <br />
        Deutschland
      </p>

      <p>
        E-Mail:
        {" "}
        info@lavieparfum.de
      </p>

      <h2>2. Allgemeine Hinweise</h2>

      <p>
        Der Schutz Ihrer persönlichen Daten ist uns wichtig.
        Wir behandeln Ihre personenbezogenen Daten vertraulich
        und entsprechend den gesetzlichen Datenschutzvorschriften.
      </p>

      <h2>3. Erhebung und Speicherung personenbezogener Daten</h2>

      <p>
        Beim Besuch unserer Website werden automatisch Informationen
        durch den Browser Ihres Endgerätes an unseren Server gesendet.
        Diese Informationen werden temporär in sogenannten Logfiles gespeichert.
      </p>

      <h2>4. Bestellungen und Zahlungsabwicklung</h2>

      <p>
        Zur Abwicklung von Bestellungen verarbeiten wir die von Ihnen
        angegebenen personenbezogenen Daten wie Name, Anschrift,
        E-Mail-Adresse und Zahlungsinformationen.
      </p>

      <p>
        Die Zahlungsabwicklung erfolgt über Stripe.
      </p>

      <h2>5. Cookies</h2>

      <p>
        Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit
        und Funktionalität der Website zu verbessern.
      </p>

      <h2>6. Ihre Rechte</h2>

      <p>
        Sie haben jederzeit das Recht auf Auskunft, Berichtigung,
        Löschung oder Einschränkung der Verarbeitung Ihrer Daten
        sowie das Recht auf Datenübertragbarkeit.
      </p>

      <h2>7. Kontakt</h2>

      <p>
        Bei Fragen zum Datenschutz können Sie uns jederzeit kontaktieren:
      </p>

      <p>
        info@lavieparfum.de
      </p>

    </main>
  );
}
