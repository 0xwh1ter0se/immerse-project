import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

/** Kata yang di-highlight blok pink miring — aksen judul. */
export function Hl({ className, ...rest }: ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={cn('inline-block -rotate-[1.5deg] border-ink-3 bg-pink px-3 shadow-brutal-md', className)}
      {...rest}
    />
  );
}
