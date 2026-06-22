export default function Impressum() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold text-yellow-400 mb-10">
          Impressum
        </h1>

        <div className="space-y-6 text-lg">

          <div>
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
              Angaben gemäß § 5 TMG
            </h2>

            <p>
              Hussin Abd Hussin
              <br />
              Handelnd unter der Marke „La Vie Parfum“
            </p>

            <p className="mt-4">
              Mozartstraße 2
              <br />
              92318 Neumarkt i.d.OPf.
              <br />
              Deutschland
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
              Kontakt
            </h2>

            <p>
              E-Mail: info@lavieparfum.de
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>

            <p>
              Hussin Abd Hussin
              <br />
              Mozartstraße 2
              <br />
              92318 Neumarkt i.d.OPf.
              <br />
              Deutschland
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
