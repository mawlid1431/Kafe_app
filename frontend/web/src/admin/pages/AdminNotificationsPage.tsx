import { PageHeader } from '@/admin/components/PageHeader';
import { cn } from '@/lib/utils';

const NOTIFICATION_TEMPLATES = [
  {
    id: 'order-update',
    title: 'Order update',
    body: 'Your order status changed — open the app to track delivery or pickup.',
    type: 'order',
  },
  {
    id: 'promo-weekend',
    title: 'Weekend 2× points',
    body: 'Earn double points on all orders this Saturday & Sunday.',
    type: 'promo',
  },
  {
    id: 'reward-earned',
    title: 'Points earned',
    body: 'Thanks for your order. Redeem rewards anytime from the Rewards tab.',
    type: 'reward',
  },
] as const;

export function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="In-app notification templates used in the mobile app. Push delivery connects here later."
      />

      <div className="space-y-3">
        {NOTIFICATION_TEMPLATES.map((n, i) => (
          <div key={n.id} className={cn('admin-card transition hover:border-primary/25 animate-page', `stagger-${i + 1}`)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{n.type}</p>
              <span className="rounded-full bg-cream px-2 py-0.5 text-xs text-muted">{n.id}</span>
            </div>
            <p className="mt-2 font-semibold text-coffee-dark">{n.title}</p>
            <p className="mt-1 text-sm text-muted">{n.body}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">
        Matches seed notifications in the app. Broadcast & scheduling coming in a future update.
      </p>
    </div>
  );
}
