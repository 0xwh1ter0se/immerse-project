import { type ButtonHTMLAttributes } from "react";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Chip({ className = "", selected = false, type = "button", ...props }: ChipProps) {
  const stateClasses = selected
    ? "border-blue bg-blue-subtle text-blue"
    : "border-border bg-bg-surface text-text-secondary";

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`inline-flex min-h-11 items-center justify-center rounded-pill border px-4 text-sm font-medium outline-none transition-[transform,opacity,background-color,border-color,color,box-shadow] duration-chip ease-out focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 ${stateClasses} ${className}`}
      {...props}
    />
  );
}
