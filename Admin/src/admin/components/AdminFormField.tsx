import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminFormField({
  label,
  htmlFor,
  children,
  className,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn('grid min-w-0 gap-1.5 sm:gap-2', className)}>
      <label className="admin-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}

export const adminInputClass = 'admin-input';
