import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

type ButtonProps = ComponentPropsWithoutRef<'a'> & {
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'lg';
};

/**
 * Tombol landing. Di landing semua tombol adalah tautan anchor
 * (#demo, #coba) — render <a>. Halaman auth nanti akan punya
 * <button> sendiri dengan API variant/size yang sama.
 */
export function Button({ variant = 'primary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <a
      className={cn(
        'press inline-flex touch-manipulation select-none items-center justify-center gap-2 rounded-md border-ink-3 bg-paper px-5 py-3 text-[15px] font-black text-ink shadow-brutal-lg',
        'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-md',
        'active:translate-x-[3px] active:translate-y-[3px] active:shadow-brutal-xs',
        variant === 'primary' && 'bg-lime',
        size === 'lg' && 'px-8 py-4 text-[18px]',
        className,
      )}
      {...rest}
    />
  );
}
