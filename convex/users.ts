import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getCurrentUser, getCurrentUserOrNull } from './lib/auth';

export const me = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      tokenIdentifier: v.string(),
      name: v.string(),
      email: v.string(),
      pictureUrl: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

export const upsertFromAuth = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch('users', existing._id, {
        name: args.name,
        email: args.email,
        pictureUrl: args.pictureUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('users', {
      tokenIdentifier: identity.tokenIdentifier,
      name: args.name,
      email: args.email,
      pictureUrl: args.pictureUrl,
      createdAt: now,
    });
  },
});

export const requireMe = query({
  args: {},
  returns: v.object({
    _id: v.id('users'),
    _creationTime: v.number(),
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});
