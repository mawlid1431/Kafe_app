import { query } from './_generated/server';
import { v } from 'convex/values';
import { calcPromoDiscount } from './lib/orderRules';
import { getActivePromoByCode } from './lib/orderPricing';

/** Validate a promo code against cart subtotal — used at checkout. */
export const validate = query({
  args: {
    code: v.string(),
    subtotal: v.number(),
  },
  returns: v.union(
    v.object({
      valid: v.literal(true),
      code: v.string(),
      label: v.string(),
      discount: v.number(),
      discountPercent: v.optional(v.number()),
      fixedOff: v.optional(v.number()),
      minSpend: v.optional(v.number()),
    }),
    v.object({
      valid: v.literal(false),
      reason: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const promo = await getActivePromoByCode(ctx, args.code);
    if (!promo) {
      return { valid: false as const, reason: 'Invalid promo code' };
    }

    const discount = calcPromoDiscount(args.subtotal, promo);
    if (discount === 0 && promo.minSpend !== undefined && args.subtotal < promo.minSpend) {
      return {
        valid: false as const,
        reason: `Min spend RM ${promo.minSpend.toFixed(0)} required`,
      };
    }

    const row = await ctx.db
      .query('promos')
      .withIndex('by_code', (q) => q.eq('code', promo.code))
      .unique();

    return {
      valid: true as const,
      code: promo.code,
      label: row?.title ?? promo.code,
      discount,
      discountPercent: promo.discountPercent,
      fixedOff: promo.fixedOff,
      minSpend: promo.minSpend,
    };
  },
});
