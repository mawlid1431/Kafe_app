import { query } from './_generated/server';
import { v } from 'convex/values';

const branchPublic = v.object({
  slug: v.string(),
  label: v.string(),
  address: v.string(),
  hours: v.string(),
  imageUrl: v.optional(v.string()),
  lat: v.number(),
  lng: v.number(),
});

const menuPublic = v.object({
  legacyId: v.optional(v.number()),
  name: v.string(),
  description: v.string(),
  price: v.number(),
  category: v.string(),
  imageUrl: v.string(),
  rating: v.optional(v.number()),
  calories: v.optional(v.number()),
  badge: v.optional(v.string()),
});

const promoPublic = v.object({
  title: v.string(),
  subtitle: v.string(),
  code: v.string(),
  imageUrl: v.optional(v.string()),
  discountPercent: v.optional(v.number()),
  fixedOff: v.optional(v.number()),
  minSpend: v.optional(v.number()),
});

/** Public catalog — no auth; admin edits sync live to the mobile app. */
export const listBranches = query({
  args: {},
  returns: v.array(branchPublic),
  handler: async (ctx) => {
    const rows = await ctx.db.query('branches').withIndex('by_sort').collect();
    return rows
      .filter((b) => b.active)
      .map((b) => ({
        slug: b.slug,
        label: b.label,
        address: b.address,
        hours: b.hours,
        imageUrl: b.imageUrl,
        lat: b.lat,
        lng: b.lng,
      }));
  },
});

export const listMenu = query({
  args: {
    category: v.optional(v.string()),
  },
  returns: v.array(menuPublic),
  handler: async (ctx, args) => {
    const rows = await ctx.db.query('menuItems').withIndex('by_sort').collect();
    const active = rows.filter((i) => i.active);
    const filtered =
      args.category && args.category !== 'All'
        ? active.filter((i) => i.category === args.category)
        : active;
    return filtered.map((i) => ({
      legacyId: i.legacyId,
      name: i.name,
      description: i.description,
      price: i.price,
      category: i.category,
      imageUrl: i.imageUrl,
      rating: i.rating,
      calories: i.calories,
      badge: i.badge,
    }));
  },
});

export const listCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const items = await ctx.db.query('menuItems').collect();
    const cats = new Set(items.filter((i) => i.active).map((i) => i.category));
    return ['All', ...[...cats].sort()];
  },
});

export const listPromos = query({
  args: {},
  returns: v.array(promoPublic),
  handler: async (ctx) => {
    const rows = await ctx.db.query('promos').withIndex('by_sort').collect();
    return rows
      .filter((p) => p.active)
      .map((p) => ({
        title: p.title,
        subtitle: p.subtitle,
        code: p.code,
        imageUrl: p.imageUrl,
        discountPercent: p.discountPercent,
        fixedOff: p.fixedOff,
        minSpend: p.minSpend,
      }));
  },
});
