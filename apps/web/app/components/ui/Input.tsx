import { type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`min-h-11 w-full rounded-md border border-border bg-bg-elevated px-4 text-base text-text-primary outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-text-muted focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus/20 aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error/20 ${className}`}
      {...props}
    />
  );
}
