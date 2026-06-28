import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { OrderCard, OrdersEmpty } from './AdminOrdersShared';

/** Active orders out for delivery or ready for pickup. */
export function AdminOrdersTrackPage() {
  const adminToken = useAdminToken();
  const orders = useQuery(
    api.ordersAdmin.list,
    adminToken ? { adminToken, status: 'active' } : 'skip',
  );

  const tracking = useMemo(
    () => orders?.filter((o) => o.trackingStep >= 2) ?? [],
    [orders],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {tracking.length} order{tracking.length === 1 ? '' : 's'} in transit or ready for pickup
      </p>
      {tracking.map((order, i) => (
        <OrderCard key={order._id} order={order} showAdvance index={i} />
      ))}
      {tracking.length === 0 && (
        <OrdersEmpty message="No orders out for delivery or awaiting pickup." />
      )}
    </div>
  );
}
