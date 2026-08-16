import { useMemo } from 'react';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { useApiQuery } from '@/lib/useApiQuery';
import type { Order } from '@/lib/apiTypes';
import { OrderCard, OrdersEmpty } from './AdminOrdersShared';

export function AdminOrdersHistoryPage() {
  const adminToken = useAdminToken();
  const delivered = useApiQuery<Order[]>(adminToken ? '/admin/orders?status=delivered' : null);
  const cancelled = useApiQuery<Order[]>(adminToken ? '/admin/orders?status=cancelled' : null);

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
        <OrderCard key={order.id} order={order} compact index={i} />
      ))}
      {history.length === 0 && (
        <OrdersEmpty message="No order history yet." />
      )}
    </div>
  );
}
