import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

const adminTokenArg = { adminToken: v.string() };

export const listCustomers = query({
  args: adminTokenArg,
  returns: v.array(
    v.object({
      _id: v.id('users'),
      name: v.string(),
      email: v.string(),
      pictureUrl: v.optional(v.string()),
      branchSlug: v.optional(v.string()),
      points: v.number(),
      suspended: v.boolean(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const users = await ctx.db.query('users').withIndex('by_created').order('desc').collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      pictureUrl: u.pictureUrl,
      branchSlug: u.branchSlug,
      points: u.points ?? 0,
      suspended: u.suspended ?? false,
      createdAt: u.createdAt,
    }));
  },
});

export const updateCustomer = mutation({
  args: {
    adminToken: v.string(),
    userId: v.id('users'),
    points: v.optional(v.number()),
    suspended: v.optional(v.boolean()),
    branchSlug: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const user = await ctx.db.get('users', args.userId);
    if (!user) throw new Error('Customer not found.');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.points !== undefined) patch.points = Math.max(0, args.points);
    if (args.suspended !== undefined) patch.suspended = args.suspended;
    if (args.branchSlug !== undefined) patch.branchSlug = args.branchSlug;

    await ctx.db.patch('users', args.userId, patch);
    return null;
  },
});
