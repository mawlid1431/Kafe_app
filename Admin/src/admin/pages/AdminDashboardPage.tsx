import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { ArrowUpRight, Store, UtensilsCrossed, ShoppingBag, Tag, Users, Gift, Bell } from 'lucide-react';
import { api } from '@convex/_generated/api';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { LiveBadge, PageHeader } from '@/admin/components/PageHeader';
import { formatPrice } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const SECTIONS: Array<{ title: string; subtitle: string; to: string; icon: LucideIcon }> = [
  { title: 'Orders', subtitle: 'Process, track delivery & view history', to: '/orders', icon: ShoppingBag },
  { title: 'Menu', subtitle: 'Drinks, food & categories for the app', to: '/menu', icon: UtensilsCrossed },
  { title: 'Branches', subtitle: 'Alor Setar, Penang & Kuala Lumpur', to: '/branches', icon: Store },
  { title: 'Promos', subtitle: 'Banners and promo codes', to: '/promos', icon: Tag },
  { title: 'Users', subtitle: 'App users & loyalty points', to: '/customers', icon: Users },
  { title: 'Rewards', subtitle: 'Tiers and redemption catalog', to: '/rewards', icon: Gift },
  { title: 'Notifications', subtitle: 'Push & in-app message templates', to: '/notifications', icon: Bell },
];

function MetricCard({ label, value, hint, delay }: { label: string; value: string; hint?: string; delay: string }) {
  return (
    <div className={`admin-card-metric animate-page ${delay}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-coffee-dark">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function SectionCard({ title, subtitle, to, icon: Icon, delay }: (typeof SECTIONS)[number] & { delay: string }) {
  return (
    <Link to={to} className={`admin-card-interactive group flex flex-col ${delay}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary/15">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-primary" />
      </div>
      <p className="mt-4 text-sm font-semibold text-coffee-dark">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
    </Link>
  );
}

export function AdminDashboardPage() {
  const adminToken = useAdminToken();
  const overview = useQuery(api.adminDashboard.overview, adminToken ? { adminToken } : 'skip');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your Kafe Eman mobile app — orders, users, menu & branches at a glance."
        badge={overview ? <LiveBadge /> : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard delay="stagger-1" label="Total revenue" value={overview ? formatPrice(overview.totalRevenue) : '—'} hint={overview ? `Last ${overview.periodDays}d: ${formatPrice(overview.periodRevenue)}` : undefined} />
        <MetricCard delay="stagger-2" label="Orders" value={overview ? String(overview.totalOrders) : '—'} hint={overview ? `${overview.activeOrders} active now` : undefined} />
        <MetricCard delay="stagger-3" label="Users" value={overview ? String(overview.totalCustomers) : '—'} hint={overview ? `+${overview.newCustomers} new this period` : undefined} />
        <MetricCard delay="stagger-4" label="Menu items" value={overview ? String(overview.menuItems) : '—'} hint={overview ? `${overview.activePromos} active promos` : undefined} />
      </div>

      {overview && overview.ordersTrend.length > 0 && (
        <div className="admin-card animate-page stagger-2">
          <h2 className="text-sm font-semibold text-coffee-dark">Orders trend · last {overview.periodDays} days</h2>
          <p className="mt-0.5 text-xs text-muted">Hover bars for daily counts</p>
          <div className="mt-5 flex h-36 items-end gap-1.5">
            {overview.ordersTrend.map((day, i) => {
              const max = Math.max(...overview.ordersTrend.map((d) => d.orders), 1);
              const height = Math.max(10, (day.orders / max) * 100);
              return (
                <div
                  key={day.timestamp}
                  className="admin-chart-bar group relative flex flex-col items-center justify-end"
                  style={{ height: `${height}%`, animationDelay: `${i * 0.03}s` }}
                  title={`${new Date(day.timestamp).toLocaleDateString()}: ${day.orders} orders`}
                >
                  <span className="pointer-events-none absolute -top-6 rounded-md bg-coffee-dark px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                    {day.orders}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="animate-page stagger-3">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted">Quick manage</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SECTIONS.map((s, i) => (
            <SectionCard key={s.to} {...s} delay={`stagger-${(i % 4) + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
