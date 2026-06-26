export type PromoCode = {
  code: string;
  label: string;
  discountPercent?: number;
  fixedOff?: number;
  minSpend?: number;
};

export const PROMO_CODES: PromoCode[] = [
  { code: 'WELCOME10', label: '10% off your order', discountPercent: 10, minSpend: 15 },
  { code: 'KEAMAN15', label: '15% off — weekend special', discountPercent: 15, minSpend: 25 },
  { code: 'FREESHIP', label: 'Free delivery', fixedOff: 3, minSpend: 20 },
  { code: 'BOGO50', label: 'RM 5 off drinks', fixedOff: 5, minSpend: 18 },
];

export function findPromo(code: string): PromoCode | null {
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES.find((p) => p.code === normalized) ?? null;
}

export function calcPromoDiscount(subtotal: number, promo: PromoCode | null): number {
  if (!promo) return 0;
  if (promo.minSpend && subtotal < promo.minSpend) return 0;
  if (promo.discountPercent) return Math.round(subtotal * promo.discountPercent) / 100;
  if (promo.fixedOff) return Math.min(promo.fixedOff, subtotal);
  return 0;
}

export function pointsForSpend(amount: number): number {
  return Math.max(1, Math.floor(amount));
}

/** 100 points = RM 1 off */
export const POINTS_PER_RM = 100;

export function pointsToRmDiscount(points: number): number {
  return Math.floor(points / POINTS_PER_RM);
}

export function maxRedeemablePoints(balance: number, orderTotalBeforePoints: number): number {
  const capByTotal = Math.floor(orderTotalBeforePoints) * POINTS_PER_RM;
  return Math.min(balance, Math.max(0, capByTotal));
}
