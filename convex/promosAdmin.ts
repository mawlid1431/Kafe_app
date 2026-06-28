import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

const adminTokenArg = { adminToken: v.string() };

const promoDoc = v.object({
  _id: v.id('promos'),
  _creationTime: v.number(),
  title: v.string(),
  subtitle: v.string(),
  code: v.string(),
  imageUrl: v.optional(v.string()),
  active: v.boolean(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const listAll = query({
  args: adminTokenArg,
  returns: v.array(promoDoc),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    return await ctx.db.query('promos').withIndex('by_sort').collect();
  },
});

export const create = mutation({
  args: {
    adminToken: v.string(),
    title: v.string(),
    subtitle: v.string(),
    code: v.string(),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
  },
  returns: v.id('promos'),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const code = args.code.trim().toUpperCase();
    const existing = await ctx.db
      .query('promos')
      .withIndex('by_code', (q) => q.eq('code', code))
      .unique();
    if (existing) throw new Error('Promo code already exists.');

    const all = await ctx.db.query('promos').collect();
    const now = Date.now();
    return await ctx.db.insert('promos', {
      title: args.title.trim(),
      subtitle: args.subtitle.trim(),
      code,
      imageUrl: args.imageUrl,
      active: args.active,
      sortOrder: all.length + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    adminToken: v.string(),
    promoId: v.id('promos'),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    code: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const promo = await ctx.db.get('promos', args.promoId);
    if (!promo) throw new Error('Promo not found.');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.subtitle !== undefined) patch.subtitle = args.subtitle.trim();
    if (args.code !== undefined) patch.code = args.code.trim().toUpperCase();
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl;
    if (args.active !== undefined) patch.active = args.active;

    await ctx.db.patch('promos', args.promoId, patch);
    return null;
  },
});

export const remove = mutation({
  args: {
    adminToken: v.string(),
    promoId: v.id('promos'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    await ctx.db.delete('promos', args.promoId);
    return null;
  },
});
