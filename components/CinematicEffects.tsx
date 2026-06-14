"use client";

export default function CinematicEffects() {

  const particles = Array.from({ length: 120 }).map((_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 14}s`,
    duration: `${10 + Math.random() * 16}s`,
    size: `${2 + Math.random() * 3}px`,
  }));


  return (

    <div className="cinematic-effects">

      <div className="golden-glow" />

      <div className="soft-smoke" />

      {particles.map((p) => (

        <span

          key={p.id}

          className="gold-particle"

          style={{

            left: p.left,

            animationDelay: p.delay,

            animationDuration: p.duration,

            width: p.size,

            height: p.size,

          }}

        />

      ))}

    </div>

  );

}
