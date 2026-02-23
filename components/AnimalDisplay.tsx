import { AnimalType, AnimalColor, ANIMALS, COLORS } from "@/lib/animals";

interface AnimalDisplayProps {
  type: AnimalType;
  color: AnimalColor;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeClasses = {
  sm: "text-4xl",
  md: "text-6xl",
  lg: "text-8xl",
  xl: "text-[120px]",
};

const containerSizes = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  lg: "w-36 h-36",
  xl: "w-48 h-48",
};

export function AnimalDisplay({ type, color, name, size = "md", animated = true }: AnimalDisplayProps) {
  const animal = ANIMALS[type];
  const colorInfo = COLORS[color];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${containerSizes[size]} flex items-center justify-center rounded-full shadow-lg ${animated ? "animate-float" : ""}`}
        style={{ backgroundColor: colorInfo.hex + "30", border: `4px solid ${colorInfo.hex}` }}
      >
        <span className={sizeClasses[size]}>{animal.emoji}</span>
      </div>
      {name && (
        <span className="text-lg font-bold text-gray-700">{name}</span>
      )}
    </div>
  );
}
