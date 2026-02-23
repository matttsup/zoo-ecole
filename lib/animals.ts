export type AnimalType = "lapin" | "chat" | "chien" | "hamster" | "tortue" | "perroquet";

export type AnimalColor = "rose" | "bleu" | "vert" | "orange" | "violet" | "jaune" | "rouge" | "turquoise";

export const ANIMALS: Record<AnimalType, { emoji: string; label: string; food: string; foodEmoji: string }> = {
  lapin: { emoji: "🐰", label: "Lapin", food: "carotte", foodEmoji: "🥕" },
  chat: { emoji: "🐱", label: "Chat", food: "poisson", foodEmoji: "🐟" },
  chien: { emoji: "🐶", label: "Chien", food: "os", foodEmoji: "🦴" },
  hamster: { emoji: "🐹", label: "Hamster", food: "graine", foodEmoji: "🌻" },
  tortue: { emoji: "🐢", label: "Tortue", food: "feuille", foodEmoji: "🍃" },
  perroquet: { emoji: "🦜", label: "Perroquet", food: "fruit", foodEmoji: "🍎" },
};

export const COLORS: Record<AnimalColor, { hex: string; label: string }> = {
  rose: { hex: "#FF6B9D", label: "Rose" },
  bleu: { hex: "#4ECDC4", label: "Bleu" },
  vert: { hex: "#A8E6CF", label: "Vert" },
  orange: { hex: "#FFB347", label: "Orange" },
  violet: { hex: "#9B59B6", label: "Violet" },
  jaune: { hex: "#FFD93D", label: "Jaune" },
  rouge: { hex: "#E74C3C", label: "Rouge" },
  turquoise: { hex: "#1ABC9C", label: "Turquoise" },
};

export function getAnimalInfo(type: AnimalType) {
  return ANIMALS[type];
}

export function getColorInfo(color: AnimalColor) {
  return COLORS[color];
}
