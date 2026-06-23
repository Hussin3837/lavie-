"use client";

export default function CinematicEffects() {

 const particles = Array.from({ length: 120 }).map((_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 14) * 0.35}s`,
  duration: `${10 + (index % 16)}s`,
  size: `${2 + (index % 3)}px`,
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
