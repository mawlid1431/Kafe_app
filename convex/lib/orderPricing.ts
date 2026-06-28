import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import {
  computeOrderTotals,
  reverseOrderPoints,
  type OrderLineInput,
  type PricedLine,
  type PromoRules,
} from './orderRules';

type Ctx = QueryCtx | MutationCtx;

export async function getActiveBranch(ctx: Ctx, branchSlug: string) {
  const slug = branchSlug.trim().toLowerCase();
  const branch = await ctx.db
    .query('branches')
    .withIndex('by_slug', (q) => q.eq('slug', slug))
    .unique();
  if (!branch || !branch.active) {
    throw new Error('Branch not found or inactive.');
  }
  return branch;
}

export async function getActivePromoByCode(
  ctx: Ctx,
  code: string | undefined,
): Promise<PromoRules | null> {
  if (!code?.trim()) return null;
  const normalized = code.trim().toUpperCase();
  const promo = await ctx.db
    .query('promos')
    .withIndex('by_code', (q) => q.eq('code', normalized))
    .unique();
  if (!promo || !promo.active) return null;
  return {
    code: promo.code,
    discountPercent: promo.discountPercent,
    fixedOff: promo.fixedOff,
    minSpend: promo.minSpend,
  };
}

export async function priceOrderLines(
  ctx: Ctx,
  lines: OrderLineInput[],
): Promise<PricedLine[]> {
  if (lines.length === 0) throw new Error('Cart is empty.');

  const menuItems = await ctx.db.query('menuItems').collect();
  const byLegacyId = new Map<number, Doc<'menuItems'>>();
  const byName = new Map<string, Doc<'menuItems'>>();
  for (const item of menuItems) {
    if (item.legacyId !== undefined) byLegacyId.set(item.legacyId, item);
    byName.set(item.name.toLowerCase(), item);
  }

  return lines.map((line) => {
    if (line.qty < 1) throw new Error('Invalid item quantity.');
    let menuItem: Doc<'menuItems'> | undefined;
    if (line.menuItemId !== undefined) {
      menuItem = byLegacyId.get(line.menuItemId);
    }
    if (!menuItem) {
      menuItem = byName.get(line.name.trim().toLowerCase());
    }
    if (!menuItem || !menuItem.active) {
      throw new Error(`Menu item not available: ${line.name}`);
    }
    return {
      menuItemId: menuItem.legacyId ?? line.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      qty: line.qty,
      sugar: line.sugar,
      ice: line.ice,
    };
  });
}

export async function buildOrderPricing(
  ctx: Ctx,
  args: {
    lines: OrderLineInput[];
    orderType: 'delivery' | 'pickup';
    promoCode?: string;
    pointsToRedeem?: number;
    userPointsBalance: number;
  },
) {
  const pricedLines = await priceOrderLines(ctx, args.lines);
  const promo = await getActivePromoByCode(ctx, args.promoCode);
  const totals = computeOrderTotals({
    lines: pricedLines,
    orderType: args.orderType,
    promo,
    pointsToRedeem: args.pointsToRedeem ?? 0,
    userPointsBalance: args.userPointsBalance,
  });
  return { pricedLines, promo, totals };
}

export async function refundOrderPoints(
  ctx: MutationCtx,
  order: Doc<'orders'>,
) {
  if (!order.userId) return;
  const user = await ctx.db.get('users', order.userId);
  if (!user) return;

  const nextPoints = reverseOrderPoints(user.points ?? 0, order);
  await ctx.db.patch('users', order.userId, {
    points: nextPoints,
    updatedAt: Date.now(),
  });
}
