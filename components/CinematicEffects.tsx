"use client";

import { useMemo } from "react";

export default function CinematicEffects() {
  const particles = useMemo(
    () =>
      Array.from({ length: 120 }).map((_, index) => ({
        id: index,
        left: ${Math.random() * 100}%,
        delay: ${Math.random() * 14}s,
        duration: ${10 + Math.random() * 16}s,
        size: ${2 + Math.random() * 3}px,
        opacity: 0.45 + Math.random() * 0.45,
      })),
    []
  );

  return (
    <div className="cinematic-effects" aria-hidden="true">
      <div className="golden-glow" />
      <div className="soft-smoke" />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="gold-particle"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}
