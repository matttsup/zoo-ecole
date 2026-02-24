"use client";

import { useEffect, useState } from "react";

const COLORS = ["#FF6B9D", "#FFD93D", "#4ECDC4", "#9B59B6", "#FFB347", "#A8E6CF", "#FF8B94", "#74B9FF"];

type Particle = {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  shape: "circle" | "square" | "star";
};

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      shape: (["circle", "square", "star"] as const)[Math.floor(Math.random() * 3)],
    }));
    setParticles(newParticles);
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== "star" ? p.color : "transparent",
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            ...(p.shape === "star" ? { fontSize: p.size, lineHeight: 1 } : {}),
          }}
        >
          {p.shape === "star" && "⭐"}
        </div>
      ))}
    </div>
  );
}
