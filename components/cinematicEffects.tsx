"use client";

export default function CinematicEffects() {
  const particles = Array.from({ length: 28 });

  return (
    <div className="cinematic-effects">
      <div className="golden-glow" />
      <div className="soft-smoke" />

      {particles.map((_, index) => (
        <span
          key={index}
          className="gold-particle"
          style={{
            left: ${Math.random() * 100}%,
            animationDelay: ${Math.random() * 12}s,
            animationDuration: ${12 + Math.random() * 14}s,
          }}
        />
      ))}

      <span className="gold-butterfly butterfly-one">✦</span>
      <span className="gold-butterfly butterfly-two">✧</span>
    </div>
  );
}
