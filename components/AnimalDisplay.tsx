import { AnimalType, AnimalColor, ANIMALS, COLORS } from "@/lib/animals";

interface AnimalDisplayProps {
  type: AnimalType;
  color: AnimalColor;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  niveau?: number;
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

const accessorySizes = {
  sm: "text-lg -top-2 -right-1",
  md: "text-2xl -top-3 -right-2",
  lg: "text-3xl -top-4 -right-3",
  xl: "text-4xl -top-5 -right-4",
};

const frameSizes = {
  sm: "ring-2 ring-offset-1",
  md: "ring-[3px] ring-offset-2",
  lg: "ring-4 ring-offset-2",
  xl: "ring-4 ring-offset-[3px]",
};

function getAccessory(niveau: number): string {
  if (niveau >= 15) return "👑";
  if (niveau >= 10) return "🎩";
  if (niveau >= 7) return "🎀";
  if (niveau >= 5) return "⭐";
  if (niveau >= 3) return "🌸";
  return "";
}

function getFrameColor(niveau: number): string {
  if (niveau >= 15) return "ring-yellow-400";
  if (niveau >= 10) return "ring-yellow-500";
  if (niveau >= 7) return "ring-purple-400";
  if (niveau >= 5) return "ring-blue-400";
  if (niveau >= 3) return "ring-green-400";
  return "";
}

export function AnimalDisplay({ type, color, name, size = "md", animated = true, niveau = 0 }: AnimalDisplayProps) {
  const animal = ANIMALS[type];
  const colorInfo = COLORS[color];
  const accessory = getAccessory(niveau);
  const frameColor = getFrameColor(niveau);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-block">
        <div
          className={`${containerSizes[size]} flex items-center justify-center rounded-full shadow-lg ${animated ? "animate-float" : ""} ${frameColor ? `${frameSizes[size]} ${frameColor}` : ""}`}
          style={{ backgroundColor: colorInfo.hex + "30", border: `4px solid ${colorInfo.hex}` }}
        >
          <span className={sizeClasses[size]}>{animal.emoji}</span>
        </div>
        {accessory && (
          <span className={`absolute ${accessorySizes[size]} pointer-events-none`}>
            {accessory}
          </span>
        )}
      </div>
      {name && (
        <span className="text-lg font-bold text-gray-700">{name}</span>
      )}
    </div>
  );
}
