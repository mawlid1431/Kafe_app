import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { OrderCard, OrdersEmpty } from './AdminOrdersShared';

export function AdminOrdersHistoryPage() {
  const adminToken = useAdminToken();
  const delivered = useQuery(
    api.ordersAdmin.list,
    adminToken ? { adminToken, status: 'delivered' } : 'skip',
  );
  const cancelled = useQuery(
    api.ordersAdmin.list,
    adminToken ? { adminToken, status: 'cancelled' } : 'skip',
  );

  const history = useMemo(() => {
    const all = [...(delivered ?? []), ...(cancelled ?? [])];
    return all.sort((a, b) => b.createdAt - a.createdAt);
  }, [delivered, cancelled]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {history.length} completed order{history.length === 1 ? '' : 's'}
      </p>
      {history.map((order, i) => (
        <OrderCard key={order._id} order={order} compact index={i} />
      ))}
      {history.length === 0 && (
        <OrdersEmpty message="No order history yet." />
      )}
    </div>
  );
}
