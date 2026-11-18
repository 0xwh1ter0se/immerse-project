import { type HTMLAttributes } from "react";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-bg-elevated text-text-secondary",
  accent: "border-accent/30 bg-accent-subtle text-text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/15 text-text-primary",
  error: "border-error/30 bg-error/10 text-error",
};

export function Badge({ className = "", tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-pill border px-2.5 text-xs font-medium leading-none ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
