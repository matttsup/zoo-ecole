interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ current, max, color = "#9B59B6", showLabel = true }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm font-medium text-gray-600">
          <span>{current}/{max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-4 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
