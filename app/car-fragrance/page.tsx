import Link from "next/link";

export default function CarFragrancePage() {
  return (
    <main className="coming-page">
      <style jsx global>{`
        .coming-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% 35%, rgba(215,178,122,.16), transparent 40%),
            linear-gradient(135deg,#080808,#15110b,#050505);
          color: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px 20px;
        }

        .coming-content {
          width: 100%;
          max-width: 850px;
          border: 1px solid rgba(215,178,122,.3);
          border-radius: 30px;
          padding: 75px 35px;
          background: rgba(255,255,255,.025);
          box-shadow: 0 30px 100px rgba(0,0,0,.4);
        }

        .coming-brand {
          color: #d7b27a;
          letter-spacing: 7px;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 45px;
        }

        .coming-symbol {
          color: #d7b27a;
          font-size: 38px;
          margin-bottom: 25px;
        }

        .coming-content h1 {
          font-family: Georgia,serif;
          font-weight: 400;
          font-size: clamp(42px,7vw,76px);
          margin: 0 0 25px;
        }

        .coming-badge {
          display: inline-block;
          border: 1px solid #d7b27a;
          color: #e6c58e;
          padding: 13px 30px;
          letter-spacing: 5px;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 30px;
        }

        .coming-content p {
          color: rgba(245,240,232,.7);
          font-size: 17px;
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .coming-back {
          display: inline-block;
          color: #111;
          background: linear-gradient(90deg,#f4d49c,#b8873b);
          padding: 15px 32px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 800;
        }

        @media(max-width:600px) {
          .coming-content { padding: 55px 22px; }
          .coming-brand { letter-spacing: 4px; }
        }
      `}</style>

      <div className="coming-content">
        <div className="coming-brand">LA VIE PARFUM</div>

        <div className="coming-symbol">✦</div>

        <h1>Car Fragrance</h1>

        <div className="coming-badge">COMING SOON</div>

        <p>
          Transform every journey into a luxurious fragrance experience.
          An exclusive collection designed for your car.
          Coming soon.
        </p>

        <Link href="/" className="coming-back">
          Return to LA VIE
        </Link>
      </div>
    </main>
  );
}
