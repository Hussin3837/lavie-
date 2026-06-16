export default function SuccessPage() {
  return (
    <main className="success-page">
      <div className="success-card">
        <img
          src="/images/logo.png"
          alt="La Vie"
          className="success-logo"
        />

        <div className="success-check">✓</div>

        <h1>Thank you for your order</h1>

        <p>
          Your payment was successful.
          <br />
          We will prepare your La Vie perfume carefully
          and ship it to you as soon as possible.
        </p>

        <a href="/" className="success-btn">
          Continue Shopping
        </a>
      </div>
    </main>
  );
}
