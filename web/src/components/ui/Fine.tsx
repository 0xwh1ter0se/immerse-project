import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

/** Catatan kecil abu — disclaimer trademark, copyright, dll. */
export function Fine({ className, ...rest }: ComponentPropsWithoutRef<'p'>) {
  return <p className={cn('mt-2.5 text-[12.5px] text-ink/65', className)} {...rest} />;
}
