import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

const adminTokenArg = { adminToken: v.string() };

const menuDoc = v.object({
  _id: v.id('menuItems'),
  _creationTime: v.number(),
  legacyId: v.optional(v.number()),
  name: v.string(),
  description: v.string(),
  price: v.number(),
  category: v.string(),
  imageUrl: v.string(),
  rating: v.optional(v.number()),
  calories: v.optional(v.number()),
  badge: v.optional(v.string()),
  active: v.boolean(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const listAll = query({
  args: {
    ...adminTokenArg,
    category: v.optional(v.string()),
  },
  returns: v.array(menuDoc),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const items = await ctx.db.query('menuItems').withIndex('by_sort').collect();
    if (args.category && args.category !== 'All') {
      return items.filter((i) => i.category === args.category);
    }
    return items;
  },
});

export const categories = query({
  args: adminTokenArg,
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const items = await ctx.db.query('menuItems').collect();
    const cats = new Set(items.map((i) => i.category));
    return ['All', ...[...cats].sort()];
  },
});

export const create = mutation({
  args: {
    adminToken: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    rating: v.optional(v.number()),
    calories: v.optional(v.number()),
    badge: v.optional(v.string()),
    active: v.boolean(),
  },
  returns: v.id('menuItems'),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const all = await ctx.db.query('menuItems').collect();
    const now = Date.now();
    return await ctx.db.insert('menuItems', {
      name: args.name.trim(),
      description: args.description.trim(),
      price: args.price,
      category: args.category.trim(),
      imageUrl: args.imageUrl.trim(),
      rating: args.rating,
      calories: args.calories,
      badge: args.badge?.trim(),
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
    menuItemId: v.id('menuItems'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    calories: v.optional(v.number()),
    badge: v.optional(v.string()),
    active: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const item = await ctx.db.get('menuItems', args.menuItemId);
    if (!item) throw new Error('Menu item not found.');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.price !== undefined) patch.price = args.price;
    if (args.category !== undefined) patch.category = args.category.trim();
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl.trim();
    if (args.rating !== undefined) patch.rating = args.rating;
    if (args.calories !== undefined) patch.calories = args.calories;
    if (args.badge !== undefined) patch.badge = args.badge?.trim();
    if (args.active !== undefined) patch.active = args.active;
    if (args.sortOrder !== undefined) patch.sortOrder = args.sortOrder;

    await ctx.db.patch('menuItems', args.menuItemId, patch);
    return null;
  },
});

export const remove = mutation({
  args: {
    adminToken: v.string(),
    menuItemId: v.id('menuItems'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    await ctx.db.delete('menuItems', args.menuItemId);
    return null;
  },
});
