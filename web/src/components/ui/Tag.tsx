import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

/** Badge kuning oval — "★ Konsep visual · belum memproses video". */
export function Tag({ className, ...rest }: ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={cn(
        'inline-block touch-manipulation select-none rounded-pill border-ink-3 bg-yellow px-4 py-1.5 font-display text-[12.5px] shadow-brutal-md',
        className,
      )}
      {...rest}
    />
  );
}
