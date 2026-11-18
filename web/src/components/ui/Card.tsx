import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type CardTone = 'yellow' | 'pink' | 'cyan' | 'lime';

const toneClass: Record<CardTone, string> = {
  yellow: 'bg-yellow',
  pink: 'bg-pink',
  cyan: 'bg-cyan',
  lime: 'bg-lime',
};

type CardProps = ComponentPropsWithoutRef<'article'> & { tone: CardTone };

/** Kartu fitur — hover: terangkat + miring, hanya di pointer presisi. */
export function Card({ tone, className, ...rest }: CardProps) {
  return (
    <article
      className={cn(
        'lift rounded-lg border-ink-4 p-6 shadow-brutal-lg',
        'hover:-translate-x-[3px] hover:-translate-y-[3px] hover:-rotate-[0.8deg] hover:shadow-brutal-hover',
        toneClass[tone],
        className,
      )}
      {...rest}
    />
  );
}
