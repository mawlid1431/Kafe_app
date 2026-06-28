import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminFormField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      <label className="admin-label">{label}</label>
      {children}
    </div>
  );
}

export const adminInputClass = 'admin-input';
