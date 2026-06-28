/** Shared order & loyalty business rules — single source of truth for app + admin. */

export const DELIVERY_FEE = 3;
export const POINTS_PER_RM = 100;

export type PromoRules = {
  code: string;
  discountPercent?: number;
  fixedOff?: number;
  minSpend?: number;
};

export function pointsForSpend(amount: number): number {
  return Math.max(1, Math.floor(amount));
}

export function pointsToRmDiscount(points: number): number {
  return Math.floor(points / POINTS_PER_RM);
}

export function maxRedeemablePoints(balance: number, orderTotalBeforePoints: number): number {
  const capByTotal = Math.floor(orderTotalBeforePoints) * POINTS_PER_RM;
  return Math.min(balance, Math.max(0, capByTotal));
}

export function calcPromoDiscount(subtotal: number, promo: PromoRules | null): number {
  if (!promo) return 0;
  if (promo.minSpend !== undefined && subtotal < promo.minSpend) return 0;
  if (promo.discountPercent !== undefined) {
    return Math.round(subtotal * promo.discountPercent) / 100;
  }
  if (promo.fixedOff !== undefined) {
    return Math.min(promo.fixedOff, subtotal);
  }
  return 0;
}

export function generateOrderNumber(now = Date.now()): string {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `KE-${y}${m}${day}-${rand}`;
}

/** Customer may cancel only while kitchen is still preparing (step 0 or 1). */
export function canCustomerCancel(status: string, trackingStep: number): boolean {
  return status === 'active' && trackingStep < 2;
}

export function maxTrackingStep(orderType: 'delivery' | 'pickup'): number {
  return orderType === 'delivery' ? 3 : 2;
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export type OrderLineInput = {
  menuItemId?: number;
  name: string;
  qty: number;
  sugar?: string;
  ice?: string;
};

export type PricedLine = OrderLineInput & { price: number };

export function computeOrderTotals(args: {
  lines: PricedLine[];
  orderType: 'delivery' | 'pickup';
  promo: PromoRules | null;
  pointsToRedeem: number;
  userPointsBalance: number;
}) {
  const subtotal = roundMoney(args.lines.reduce((sum, l) => sum + l.price * l.qty, 0));
  if (subtotal <= 0) {
    throw new Error('Cart is empty.');
  }

  const discount = roundMoney(calcPromoDiscount(subtotal, args.promo));
  const deliveryFee = args.orderType === 'delivery' ? DELIVERY_FEE : 0;
  const beforePoints = roundMoney(subtotal - discount + deliveryFee);

  const maxRedeem = maxRedeemablePoints(args.userPointsBalance, beforePoints);
  const redeemed = Math.min(Math.max(0, args.pointsToRedeem), maxRedeem);
  const pointsDiscount = pointsToRmDiscount(redeemed);
  const total = roundMoney(Math.max(0, beforePoints - pointsDiscount));
  const pointsEarned = pointsForSpend(total);

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    pointsEarned,
    pointsRedeemed: redeemed > 0 ? redeemed : undefined,
  };
}

/** Adjust user points after order create / cancel. */
export function applyPointsDelta(
  current: number,
  delta: { earned?: number; redeemed?: number },
): number {
  let next = current;
  if (delta.redeemed) next -= delta.redeemed;
  if (delta.earned) next += delta.earned;
  return Math.max(0, next);
}

/** Reverse points when an order is cancelled. */
export function reverseOrderPoints(
  current: number,
  order: { pointsEarned?: number; pointsRedeemed?: number },
): number {
  let next = current;
  if (order.pointsRedeemed) next += order.pointsRedeemed;
  if (order.pointsEarned) next -= order.pointsEarned;
  return Math.max(0, next);
}
