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

function slugify(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, '-');
}

function toBranchPublic(b: {
  slug?: string;
  label: string;
  address?: string;
  hours?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  active?: boolean;
  sortOrder?: number;
}) {
  return {
    slug: b.slug?.trim() || slugify(b.label),
    label: b.label.trim(),
    address: b.address?.trim() ?? '',
    hours: b.hours?.trim() ?? 'Open today',
    imageUrl: b.imageUrl,
    lat: typeof b.lat === 'number' && Number.isFinite(b.lat) ? b.lat : 0,
    lng: typeof b.lng === 'number' && Number.isFinite(b.lng) ? b.lng : 0,
  };
}

/** Public catalog — no auth; admin edits sync live to the mobile app. */
export const listBranches = query({
  args: {},
  returns: v.array(branchPublic),
  handler: async (ctx) => {
    const rows = await ctx.db.query('branches').collect();
    return rows
      .filter((b) => b.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(toBranchPublic);
  },
});

export const listMenu = query({
  args: {
    category: v.optional(v.string()),
  },
  returns: v.array(menuPublic),
  handler: async (ctx, args) => {
    const rows = await ctx.db.query('menuItems').collect();
    const active = rows.filter((i) => i.active !== false);
    const filtered =
      args.category && args.category !== 'All'
        ? active.filter((i) => i.category === args.category)
        : active;
    return filtered
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((i) => ({
        legacyId: i.legacyId,
        name: i.name,
        description: i.description ?? '',
        price: i.price,
        category: i.category,
        imageUrl: i.imageUrl ?? '',
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
    const cats = new Set(items.filter((i) => i.active !== false).map((i) => i.category));
    return ['All', ...[...cats].sort()];
  },
});

export const listPromos = query({
  args: {},
  returns: v.array(promoPublic),
  handler: async (ctx) => {
    const rows = await ctx.db.query('promos').collect();
    return rows
      .filter((p) => p.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
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
