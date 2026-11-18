import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

/** Pil kecil putih ber-border — daftar sumber yang didukung di hero. */
export function Chip({ className, ...rest }: ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={cn(
        'inline-block touch-manipulation select-none rounded-pill border-ink-2 bg-surface px-[13px] py-[5px] font-display text-[12px]',
        className,
      )}
      {...rest}
    />
  );
}
