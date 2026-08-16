import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  action,
  badge,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between animate-page', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-semibold tracking-tight text-coffee-dark sm:text-2xl md:text-[1.75rem]">
          {title}
        </h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {(badge || action) ? (
        <div className="admin-page-actions">
          {badge}
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function LiveBadge() {
  return (
    <span className="admin-badge-live">
      <span className="admin-badge-live-dot" />
      Live data
    </span>
  );
}
