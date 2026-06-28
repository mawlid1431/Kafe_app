import { useMutation } from 'convex/react';
import { ChevronRight, MapPin, Package } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { Doc, Id } from '@convex/_generated/dataModel';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { cn, formatDate, formatPrice } from '@/lib/utils';

export type OrderDoc = Doc<'orders'>;

const DELIVERY_STEPS = ['Order placed', 'Preparing', 'On the way', 'Arrived'] as const;
const PICKUP_STEPS = ['Order placed', 'Preparing', 'Ready for pickup'] as const;

export function trackingLabel(order: OrderDoc) {
  const steps = order.orderType === 'delivery' ? DELIVERY_STEPS : PICKUP_STEPS;
  return steps[order.trackingStep] ?? `Step ${order.trackingStep}`;
}

export function StatusBadge({ status }: { status: OrderDoc['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        status === 'active' && 'bg-primary/12 text-primary',
        status === 'delivered' && 'bg-cream text-coffee-dark',
        status === 'cancelled' && 'bg-red-50 text-error',
      )}
    >
      {status}
    </span>
  );
}

function TrackingTimeline({ order }: { order: OrderDoc }) {
  const steps = order.orderType === 'delivery' ? DELIVERY_STEPS : PICKUP_STEPS;
  const maxStep = steps.length - 1;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {steps.map((label, i) => {
        const done = order.trackingStep > i;
        const current = order.trackingStep === i && order.status === 'active';
        return (
          <div
            key={label}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs',
              done && 'border-primary/30 bg-primary/10 text-primary',
              current && 'border-primary bg-primary/15 font-semibold text-primary',
              !done && !current && 'border-outline-variant/40 text-muted',
            )}
          >
            <span
              className={cn(
                'grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold',
                (done || current) ? 'bg-primary text-on-primary' : 'bg-cream text-muted',
              )}
            >
              {i + 1}
            </span>
            {label}
          </div>
        );
      })}
      {order.status === 'delivered' && (
        <span className="self-center text-xs font-medium text-primary">✓ Complete</span>
      )}
      {order.status === 'cancelled' && (
        <span className="self-center text-xs font-medium text-error">Cancelled</span>
      )}
      {order.status === 'active' && order.trackingStep < maxStep && (
        <span className="self-center text-xs text-muted">Step {order.trackingStep + 1} of {maxStep + 1}</span>
      )}
    </div>
  );
}

export function OrderCard({
  order,
  showAdvance = false,
  compact = false,
  index = 0,
}: {
  order: OrderDoc;
  showAdvance?: boolean;
  compact?: boolean;
  index?: number;
}) {
  const adminToken = useAdminToken();
  const advanceTracking = useMutation(api.ordersAdmin.advanceTracking);
  const updateStatus = useMutation(api.ordersAdmin.updateStatus);
  const setTrackingStep = useMutation(api.ordersAdmin.setTrackingStep);

  return (
    <div
      className={cn(
        'admin-card animate-page transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-float',
        index > 0 && index <= 4 && `stagger-${index}`,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-coffee-dark">{order.orderNumber}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5" />
            {order.branchLabel}
            <span>·</span>
            <span className="capitalize">{order.orderType}</span>
            <span>·</span>
            <span className="uppercase">{order.payMethod}</span>
          </p>
          <p className="mt-1 text-xs text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-coffee-dark">{formatPrice(order.total)}</p>
          {order.pointsEarned ? (
            <p className="mt-0.5 text-xs text-primary">+{order.pointsEarned} pts</p>
          ) : null}
          <p className="mt-1 text-xs font-medium text-coffee-title">{trackingLabel(order)}</p>
        </div>
      </div>

      <ul className={cn('space-y-1 text-sm text-muted', compact ? 'mt-2' : 'mt-3')}>
        {order.items.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span>
              {line.qty}× {line.name}
              {line.sugar ? ` · ${line.sugar}` : ''}
              {line.ice ? ` · ${line.ice}` : ''}
            </span>
          </li>
        ))}
      </ul>

      {order.orderNote ? (
        <p className="mt-2 rounded-lg bg-cream/60 px-3 py-2 text-xs text-muted">
          <span className="font-medium text-coffee-title">Note:</span> {order.orderNote}
        </p>
      ) : null}

      {!compact && <TrackingTimeline order={order} />}

      {showAdvance && order.status === 'active' && adminToken && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn"
            onClick={() => advanceTracking({ adminToken, orderId: order._id as Id<'orders'> })}
          >
            Advance to next step
            <ChevronRight className="h-4 w-4" />
          </button>
          {order.trackingStep > 0 && (
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() =>
                setTrackingStep({
                  adminToken,
                  orderId: order._id as Id<'orders'>,
                  trackingStep: order.trackingStep - 1,
                })
              }
            >
              Step back
            </button>
          )}
          <button
            type="button"
            className="admin-btn-danger"
            onClick={() =>
              updateStatus({ adminToken, orderId: order._id as Id<'orders'>, status: 'cancelled' })
            }
          >
            Cancel order
          </button>
        </div>
      )}
    </div>
  );
}

export function OrdersEmpty({ message }: { message: string }) {
  return (
    <div className="admin-card animate-scale-in py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-outline-variant/40 bg-cream/80">
        <Package className="h-7 w-7 text-muted/60" />
      </div>
      <p className="mt-4 text-sm font-medium text-coffee-title">Nothing here yet</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}
