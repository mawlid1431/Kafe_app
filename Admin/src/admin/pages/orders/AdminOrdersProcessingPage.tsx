import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { OrderCard, OrdersEmpty } from './AdminOrdersShared';

/** Active orders still in kitchen (placed or preparing). */
export function AdminOrdersProcessingPage() {
  const adminToken = useAdminToken();
  const orders = useQuery(
    api.ordersAdmin.list,
    adminToken ? { adminToken, status: 'active' } : 'skip',
  );

  const processing = useMemo(
    () => orders?.filter((o) => o.trackingStep < 2) ?? [],
    [orders],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {processing.length} order{processing.length === 1 ? '' : 's'} being prepared
      </p>
      {processing.map((order, i) => (
        <OrderCard key={order._id} order={order} showAdvance index={i} />
      ))}
      {processing.length === 0 && (
        <OrdersEmpty message="No orders in the kitchen right now." />
      )}
    </div>
  );
}
