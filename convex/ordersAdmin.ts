import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

const adminTokenArg = { adminToken: v.string() };

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
  pointsEarned: v.optional(v.number()),
  pointsRedeemed: v.optional(v.number()),
  orderNote: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
});

export const list = query({
  args: {
    ...adminTokenArg,
    status: v.optional(
      v.union(v.literal('active'), v.literal('delivered'), v.literal('cancelled')),
    ),
  },
  returns: v.array(orderDoc),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    if (args.status) {
      return await ctx.db
        .query('orders')
        .withIndex('by_status_created', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    }
    return await ctx.db.query('orders').withIndex('by_created').order('desc').collect();
  },
});

export const updateStatus = mutation({
  args: {
    adminToken: v.string(),
    orderId: v.id('orders'),
    status: v.union(v.literal('active'), v.literal('delivered'), v.literal('cancelled')),
    trackingStep: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const order = await ctx.db.get('orders', args.orderId);
    if (!order) throw new Error('Order not found.');

    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.trackingStep !== undefined) patch.trackingStep = args.trackingStep;

    await ctx.db.patch('orders', args.orderId, patch);
    return null;
  },
});

export const advanceTracking = mutation({
  args: {
    adminToken: v.string(),
    orderId: v.id('orders'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const order = await ctx.db.get('orders', args.orderId);
    if (!order) throw new Error('Order not found.');
    if (order.status !== 'active') throw new Error('Only active orders can be advanced.');

    const maxStep = order.orderType === 'delivery' ? 3 : 2;
    const nextStep = Math.min(order.trackingStep + 1, maxStep);
    const delivered = nextStep >= maxStep;

    await ctx.db.patch('orders', args.orderId, {
      trackingStep: nextStep,
      status: delivered ? 'delivered' : 'active',
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setTrackingStep = mutation({
  args: {
    adminToken: v.string(),
    orderId: v.id('orders'),
    trackingStep: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const order = await ctx.db.get('orders', args.orderId);
    if (!order) throw new Error('Order not found.');
    if (order.status !== 'active') throw new Error('Only active orders can be updated.');

    const maxStep = order.orderType === 'delivery' ? 3 : 2;
    const step = Math.max(0, Math.min(args.trackingStep, maxStep));

    await ctx.db.patch('orders', args.orderId, {
      trackingStep: step,
      updatedAt: Date.now(),
    });
    return null;
  },
});
