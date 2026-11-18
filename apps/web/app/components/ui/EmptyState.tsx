import { Button } from "../ui/Button";

interface EmptyStateProps {
  mark?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  mark = "Aa",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-bg-surface p-8 text-center shadow-card">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elevated font-display text-2xl font-bold text-text-secondary"
        aria-hidden="true"
      >
        {mark}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold leading-heading text-text-primary">
        {title}
      </h3>
      <p className="mt-2 max-w-prose text-sm leading-body text-text-secondary">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex min-h-11 items-center rounded-pill border border-blue bg-blue px-5 text-sm font-semibold text-text-inverse transition-[opacity,transform] duration-fast hover:bg-blue-hover"
            >
              {actionLabel}
            </a>
          ) : (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
