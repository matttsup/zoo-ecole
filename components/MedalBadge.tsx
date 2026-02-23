import { getMedal, MEDALS } from "@/lib/levels";

interface MedalBadgeProps {
  niveau: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

export function MedalBadge({ niveau, size = "md" }: MedalBadgeProps) {
  const medal = getMedal(niveau);

  if (medal === "none") {
    return (
      <span className={`${sizeClasses[size]} opacity-30`}>🏅</span>
    );
  }

  return (
    <span className={sizeClasses[size]} title={`Médaille ${MEDALS[medal].label}`}>
      {MEDALS[medal].emoji}
    </span>
  );
}
