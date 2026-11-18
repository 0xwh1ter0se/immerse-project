import { type HTMLAttributes } from "react";

type CardVariant = "default" | "elevated";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border-border shadow-card",
  elevated: "border-border shadow-elevated",
};

export function Card({ className = "", variant = "default", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border bg-bg-surface p-card ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
