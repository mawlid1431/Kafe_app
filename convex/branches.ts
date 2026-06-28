import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

const adminTokenArg = { adminToken: v.string() };

const branchDoc = v.object({
  _id: v.id('branches'),
  _creationTime: v.number(),
  slug: v.string(),
  label: v.string(),
  address: v.string(),
  hours: v.string(),
  imageUrl: v.optional(v.string()),
  lat: v.number(),
  lng: v.number(),
  active: v.boolean(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const listAll = query({
  args: adminTokenArg,
  returns: v.array(branchDoc),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    return await ctx.db.query('branches').withIndex('by_sort').collect();
  },
});

export const create = mutation({
  args: {
    adminToken: v.string(),
    slug: v.string(),
    label: v.string(),
    address: v.string(),
    hours: v.string(),
    imageUrl: v.optional(v.string()),
    lat: v.number(),
    lng: v.number(),
    active: v.boolean(),
  },
  returns: v.id('branches'),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const slug = args.slug.trim().toLowerCase().replace(/\s+/g, '-');
    const existing = await ctx.db
      .query('branches')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
    if (existing) throw new Error('Branch slug already exists.');

    const all = await ctx.db.query('branches').collect();
    const now = Date.now();
    return await ctx.db.insert('branches', {
      slug,
      label: args.label.trim(),
      address: args.address.trim(),
      hours: args.hours.trim(),
      imageUrl: args.imageUrl,
      lat: args.lat,
      lng: args.lng,
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
    branchId: v.id('branches'),
    label: v.optional(v.string()),
    address: v.optional(v.string()),
    hours: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    active: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const branch = await ctx.db.get('branches', args.branchId);
    if (!branch) throw new Error('Branch not found.');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.label !== undefined) patch.label = args.label.trim();
    if (args.address !== undefined) patch.address = args.address.trim();
    if (args.hours !== undefined) patch.hours = args.hours.trim();
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl;
    if (args.lat !== undefined) patch.lat = args.lat;
    if (args.lng !== undefined) patch.lng = args.lng;
    if (args.active !== undefined) patch.active = args.active;
    if (args.sortOrder !== undefined) patch.sortOrder = args.sortOrder;

    await ctx.db.patch('branches', args.branchId, patch);
    return null;
  },
});
