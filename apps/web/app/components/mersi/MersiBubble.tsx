import { ReactNode } from "react";

interface MersiBubbleProps {
  children: ReactNode;
  className?: string;
  arrowPosition?: "left" | "right" | "bottom" | "top";
}

export function MersiBubble({
  children,
  className = "",
  arrowPosition = "left",
}: MersiBubbleProps) {
  return (
    <div
      className={`relative inline-block rounded-2xl border border-border bg-bg-surface px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed text-text-primary shadow-elevated ${className}`}
    >
      {children}
      {/* Decorative arrow / tail */}
      {arrowPosition === "left" && (
        <span
          className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 border-b border-l border-border bg-bg-surface"
          aria-hidden="true"
        />
      )}
      {arrowPosition === "bottom" && (
        <span
          className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-border bg-bg-surface"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
