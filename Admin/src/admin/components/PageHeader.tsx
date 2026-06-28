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
    <div className={cn('flex flex-wrap items-end justify-between gap-4 animate-page', className)}>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-coffee-dark md:text-[1.75rem]">
          {title}
        </h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {badge}
        {action}
      </div>
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
