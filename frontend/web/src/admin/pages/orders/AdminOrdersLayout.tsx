import { NavLink, Outlet } from 'react-router-dom';
import { adminPath } from '@/admin/adminNav';
import { PageHeader } from '@/admin/components/PageHeader';
import { cn } from '@/lib/utils';

const ORDER_TABS = [
  { to: adminPath('orders/processing'), label: 'Processing', description: 'New & preparing' },
  { to: adminPath('orders/track'), label: 'Track', description: 'Delivery & pickup' },
  { to: adminPath('orders/history'), label: 'History', description: 'Completed' },
] as const;

export function AdminOrdersLayout() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage every order from the mobile app — process in kitchen, track delivery, and review history."
      />

      <div className="admin-scroll-tabs">
        {ORDER_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn('admin-order-tab min-w-[7.5rem]', isActive && 'admin-order-tab-active')
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
