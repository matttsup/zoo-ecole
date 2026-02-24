export type Badge = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  requiredCorrect: number;
};

export const BADGES: Badge[] = [
  { id: "b10", emoji: "⭐", label: "Première étoile", description: "10 bonnes réponses", requiredCorrect: 10 },
  { id: "b20", emoji: "🌟", label: "Étoile brillante", description: "20 bonnes réponses", requiredCorrect: 20 },
  { id: "b30", emoji: "🔥", label: "En feu !", description: "30 bonnes réponses", requiredCorrect: 30 },
  { id: "b40", emoji: "🚀", label: "Fusée du savoir", description: "40 bonnes réponses", requiredCorrect: 40 },
  { id: "b50", emoji: "🏅", label: "Champion", description: "50 bonnes réponses", requiredCorrect: 50 },
  { id: "b60", emoji: "💫", label: "Super étoile", description: "60 bonnes réponses", requiredCorrect: 60 },
  { id: "b70", emoji: "🦁", label: "Roi de la jungle", description: "70 bonnes réponses", requiredCorrect: 70 },
  { id: "b80", emoji: "👑", label: "Couronne royale", description: "80 bonnes réponses", requiredCorrect: 80 },
  { id: "b90", emoji: "🌈", label: "Arc-en-ciel", description: "90 bonnes réponses", requiredCorrect: 90 },
  { id: "b100", emoji: "💎", label: "Diamant", description: "100 bonnes réponses", requiredCorrect: 100 },
  { id: "b150", emoji: "🏆", label: "Légende", description: "150 bonnes réponses", requiredCorrect: 150 },
  { id: "b200", emoji: "🌍", label: "Maître du monde", description: "200 bonnes réponses", requiredCorrect: 200 },
];

export function getEarnedBadges(totalCorrect: number): Badge[] {
  return BADGES.filter((b) => totalCorrect >= b.requiredCorrect);
}

export function getNextBadge(totalCorrect: number): Badge | null {
  return BADGES.find((b) => totalCorrect < b.requiredCorrect) || null;
}

export function getNewlyEarnedBadge(oldTotal: number, newTotal: number): Badge | null {
  const oldBadges = getEarnedBadges(oldTotal);
  const newBadges = getEarnedBadges(newTotal);
  if (newBadges.length > oldBadges.length) {
    return newBadges[newBadges.length - 1];
  }
  return null;
}
