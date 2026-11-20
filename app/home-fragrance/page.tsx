export default function HomeFragrancePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#d6b36a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "30px",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(32px, 6vw, 58px)",
          letterSpacing: "5px",
          marginBottom: "20px",
        }}
      >
        HOME FRAGRANCE
      </h1>

      <p
        style={{
          fontSize: "clamp(22px, 4vw, 34px)",
          letterSpacing: "7px",
          fontWeight: "bold",
        }}
      >
        COMING SOON
      </p>

      <a
        href="/"
        style={{
          marginTop: "45px",
          color: "#d6b36a",
          textDecoration: "none",
          border: "1px solid #d6b36a",
          padding: "13px 30px",
          letterSpacing: "2px",
        }}
      >
        BACK TO HOME
      </a>
    </main>
  );
}
