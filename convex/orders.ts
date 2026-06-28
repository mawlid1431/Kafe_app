import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser } from './lib/auth';
import {
  applyPointsDelta,
  canCustomerCancel,
  generateOrderNumber,
} from './lib/orderRules';
import { buildOrderPricing, getActiveBranch, refundOrderPoints } from './lib/orderPricing';

const orderLineInput = v.object({
  menuItemId: v.optional(v.number()),
  name: v.string(),
  qty: v.number(),
  sugar: v.optional(v.string()),
  ice: v.optional(v.string()),
});

const orderLineItem = v.object({
  menuItemId: v.optional(v.number()),
  name: v.string(),
  price: v.number(),
  qty: v.number(),
  sugar: v.optional(v.string()),
  ice: v.optional(v.string()),
});

const orderDoc = v.object({
  _id: v.id('orders'),
  _creationTime: v.number(),
  orderNumber: v.string(),
  userId: v.optional(v.id('users')),
  branchSlug: v.string(),
  branchLabel: v.string(),
  orderType: v.union(v.literal('delivery'), v.literal('pickup')),
  payMethod: v.union(v.literal('tng'), v.literal('card'), v.literal('banking')),
  status: v.union(v.literal('active'), v.literal('delivered'), v.literal('cancelled')),
  trackingStep: v.number(),
  items: v.array(orderLineItem),
  subtotal: v.number(),
  discount: v.number(),
  deliveryFee: v.number(),
  total: v.number(),
  promoCode: v.optional(v.string()),
  pointsEarned: v.optional(v.number()),
  pointsRedeemed: v.optional(v.number()),
  orderNote: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
});

/** List orders for the signed-in customer — reactive for live tracking. */
export const listMine = query({
  args: {},
  returns: v.array(orderDoc),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query('orders')
      .withIndex('by_user_created', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();
  },
});

export const getMine = query({
  args: { orderNumber: v.string() },
  returns: v.union(orderDoc, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const order = await ctx.db
      .query('orders')
      .withIndex('by_order_number', (q) => q.eq('orderNumber', args.orderNumber))
      .unique();
    if (!order || order.userId !== user._id) return null;
    return order;
  },
});

/** Place order — server recalculates all pricing; never trust client totals. */
export const create = mutation({
  args: {
    branchSlug: v.string(),
    orderType: v.union(v.literal('delivery'), v.literal('pickup')),
    payMethod: v.union(v.literal('tng'), v.literal('card'), v.literal('banking')),
    items: v.array(orderLineInput),
    promoCode: v.optional(v.string()),
    pointsToRedeem: v.optional(v.number()),
    orderNote: v.optional(v.string()),
  },
  returns: v.object({
    orderId: v.id('orders'),
    orderNumber: v.string(),
    total: v.number(),
    pointsEarned: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.suspended) {
      throw new Error('Your account is suspended. Contact support.');
    }

    const branch = await getActiveBranch(ctx, args.branchSlug);
    const { pricedLines, promo, totals } = await buildOrderPricing(ctx, {
      lines: args.items,
      orderType: args.orderType,
      promoCode: args.promoCode,
      pointsToRedeem: args.pointsToRedeem,
      userPointsBalance: user.points ?? 0,
    });

    const now = Date.now();
    const orderNumber = generateOrderNumber(now);

    const orderId = await ctx.db.insert('orders', {
      orderNumber,
      userId: user._id,
      branchSlug: branch.slug,
      branchLabel: branch.label,
      orderType: args.orderType,
      payMethod: args.payMethod,
      status: 'active',
      trackingStep: 0,
      items: pricedLines,
      subtotal: totals.subtotal,
      discount: totals.discount,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      promoCode: promo?.code,
      pointsEarned: totals.pointsEarned,
      pointsRedeemed: totals.pointsRedeemed,
      orderNote: args.orderNote?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });

    const nextPoints = applyPointsDelta(user.points ?? 0, {
      earned: totals.pointsEarned,
      redeemed: totals.pointsRedeemed,
    });
    await ctx.db.patch('users', user._id, {
      points: nextPoints,
      branchSlug: branch.slug,
      updatedAt: now,
    });

    return {
      orderId,
      orderNumber,
      total: totals.total,
      pointsEarned: totals.pointsEarned,
    };
  },
});

/** Customer cancel — only while preparing (tracking step 0 or 1). */
export const cancelMine = mutation({
  args: { orderNumber: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const order = await ctx.db
      .query('orders')
      .withIndex('by_order_number', (q) => q.eq('orderNumber', args.orderNumber))
      .unique();

    if (!order || order.userId !== user._id) {
      throw new Error('Order not found.');
    }
    if (!canCustomerCancel(order.status, order.trackingStep)) {
      throw new Error('This order can no longer be cancelled.');
    }

    await ctx.db.patch('orders', order._id, {
      status: 'cancelled',
      updatedAt: Date.now(),
    });
    await refundOrderPoints(ctx, order);
    return null;
  },
});
