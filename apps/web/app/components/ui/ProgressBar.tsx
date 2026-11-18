interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label = "Progres", className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-2 w-full overflow-hidden rounded-pill bg-border ${className}`}
    >
      <div
        className="h-full bg-blue transition-[width] duration-fast ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
