import type { Order, OrderItem, OrderStatus, OrderType, PayMethod } from '@prisma/client';
import { toNumber } from '../common/money';

/**
 * Enum case bridge.
 *
 * Postgres enums are uppercase by convention; the React Native app and the
 * admin dashboard use lowercase string literals ('active', 'delivery', 'tng').
 * Translating here keeps every frontend comparison, switch and style lookup
 * working against one consistent wire format.
 */
export const ORDER_STATUS_TO_API = {
  ACTIVE: 'active',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const satisfies Record<OrderStatus, string>;

export const ORDER_TYPE_TO_API = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
} as const satisfies Record<OrderType, string>;

export const PAY_METHOD_TO_API = {
  TNG: 'tng',
  CARD: 'card',
  BANKING: 'banking',
} as const satisfies Record<PayMethod, string>;

export type ApiOrderStatus = (typeof ORDER_STATUS_TO_API)[OrderStatus];
export type ApiOrderType = (typeof ORDER_TYPE_TO_API)[OrderType];
export type ApiPayMethod = (typeof PAY_METHOD_TO_API)[PayMethod];

export function toOrderStatus(value: string): OrderStatus {
  return value.toUpperCase() as OrderStatus;
}

export function toOrderType(value: string): OrderType {
  return value.toUpperCase() as OrderType;
}

export function toPayMethod(value: string): PayMethod {
  return value.toUpperCase() as PayMethod;
}

export type OrderWithItems = Order & { items: OrderItem[] };

export function toApiOrder(order: OrderWithItems) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId ?? undefined,
    branchSlug: undefined as string | undefined,
    branchLabel: order.branchLabel,
    orderType: ORDER_TYPE_TO_API[order.orderType],
    payMethod: PAY_METHOD_TO_API[order.payMethod],
    status: ORDER_STATUS_TO_API[order.status],
    trackingStep: order.trackingStep,
    items: order.items.map((line) => ({
      menuItemId: line.legacyMenuItemId ?? undefined,
      name: line.name,
      price: toNumber(line.price),
      qty: line.qty,
      sugar: line.sugar ?? undefined,
      ice: line.ice ?? undefined,
    })),
    subtotal: toNumber(order.subtotal),
    discount: toNumber(order.discount),
    deliveryFee: toNumber(order.deliveryFee),
    total: toNumber(order.total),
    promoCode: order.promoCode ?? undefined,
    pointsEarned: order.pointsEarned,
    pointsRedeemed: order.pointsRedeemed,
    orderNote: order.orderNote ?? undefined,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/** Variant that includes the branch slug — used by admin list views. */
export function toApiOrderWithBranch(
  order: OrderWithItems & { branch: { slug: string } | null },
) {
  return { ...toApiOrder(order), branchSlug: order.branch?.slug };
}
