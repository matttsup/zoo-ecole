"use client";

import { Badge } from "@/lib/badges";

interface BadgePopupProps {
  badge: Badge | null;
  onClose: () => void;
}

export function BadgePopup({ badge, onClose }: BadgePopupProps) {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="animate-bounceIn mx-4 w-full max-w-sm rounded-[25px] bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-zoo-orange">
          Nouveau badge !
        </div>
        <div className="my-4 text-8xl animate-wiggle">{badge.emoji}</div>
        <h2 className="text-2xl font-bold text-zoo-purple">{badge.label}</h2>
        <p className="mt-1 text-gray-500">{badge.description}</p>
        <button
          onClick={onClose}
          className="btn-primary mt-6 bg-gradient-to-r from-zoo-purple to-zoo-pink text-lg"
        >
          Super ! 🎉
        </button>
      </div>
    </div>
  );
}
