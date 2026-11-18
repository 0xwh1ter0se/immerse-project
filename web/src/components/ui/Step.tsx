import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

type StepProps = ComponentPropsWithoutRef<'li'> & {
  n: number;
  tone: 'yellow' | 'pink' | 'cyan';
  title: string;
};

/** Langkah bernomor — nomor dalam lingkaran <span> (terbaca di Wonder, bukan pseudo-element). */
export function Step({ n, tone, title, className, children, ...rest }: StepProps) {
  const toneClass = { yellow: 'bg-yellow', pink: 'bg-pink', cyan: 'bg-cyan' }[tone];
  return (
    <li
      className={cn('relative rounded-lg border-ink-4 px-5.5 pb-5.5 pt-14.5 shadow-brutal-lg', toneClass, className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="absolute top-4 left-4.5 grid size-7.5 place-items-center rounded-full border-ink-3 bg-surface font-display text-[14px]"
      >
        {n}
      </span>
      <strong className="mb-1.5 block font-display text-[16px] uppercase">{title}</strong>
      <span className="font-medium">{children}</span>
    </li>
  );
}
