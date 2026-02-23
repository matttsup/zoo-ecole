export type MedalType = "none" | "bronze" | "argent" | "or" | "diamant";

export const MEDALS: Record<MedalType, { emoji: string; label: string; minLevel: number }> = {
  none: { emoji: "", label: "", minLevel: 0 },
  bronze: { emoji: "🥉", label: "Bronze", minLevel: 3 },
  argent: { emoji: "🥈", label: "Argent", minLevel: 5 },
  or: { emoji: "🥇", label: "Or", minLevel: 10 },
  diamant: { emoji: "💎", label: "Diamant", minLevel: 15 },
};

export const POINTS_PER_LEVEL = 10;

export function getLevel(totalCarottes: number): number {
  return Math.floor(totalCarottes / POINTS_PER_LEVEL);
}

export function getProgressToNextLevel(totalCarottes: number): number {
  return totalCarottes % POINTS_PER_LEVEL;
}

export function getMedal(niveau: number): MedalType {
  if (niveau >= 15) return "diamant";
  if (niveau >= 10) return "or";
  if (niveau >= 5) return "argent";
  if (niveau >= 3) return "bronze";
  return "none";
}

export function getMedalInfo(niveau: number) {
  const medal = getMedal(niveau);
  return MEDALS[medal];
}

export function getNextMedalInfo(niveau: number): { medal: MedalType; remaining: number } | null {
  if (niveau < 3) return { medal: "bronze", remaining: 3 - niveau };
  if (niveau < 5) return { medal: "argent", remaining: 5 - niveau };
  if (niveau < 10) return { medal: "or", remaining: 10 - niveau };
  if (niveau < 15) return { medal: "diamant", remaining: 15 - niveau };
  return null;
}
