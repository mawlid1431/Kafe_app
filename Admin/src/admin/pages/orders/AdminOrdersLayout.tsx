import { NavLink, Outlet } from 'react-router-dom';
import { PageHeader } from '@/admin/components/PageHeader';
import { cn } from '@/lib/utils';

const ORDER_TABS = [
  { to: '/orders/processing', label: 'Processing', description: 'New & preparing' },
  { to: '/orders/track', label: 'Track', description: 'Delivery & pickup' },
  { to: '/orders/history', label: 'History', description: 'Completed' },
] as const;

export function AdminOrdersLayout() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage every order from the mobile app — process in kitchen, track delivery, and review history."
      />

      <div className="flex flex-wrap gap-1 border-b border-outline-variant/40">
        {ORDER_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn('admin-order-tab', isActive && 'admin-order-tab-active')
            }
          >
            <span className="block">{tab.label}</span>
            <span className="block text-[10px] font-normal text-muted">{tab.description}</span>
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
