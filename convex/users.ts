import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getCurrentUser, getCurrentUserOrNull } from './lib/auth';

const userPublic = v.object({
  _id: v.id('users'),
  _creationTime: v.number(),
  tokenIdentifier: v.string(),
  name: v.string(),
  email: v.string(),
  pictureUrl: v.optional(v.string()),
  branchSlug: v.optional(v.string()),
  points: v.number(),
  suspended: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
});

function toUserPublic(user: {
  _id: import('./_generated/dataModel').Id<'users'>;
  _creationTime: number;
  tokenIdentifier: string;
  name: string;
  email: string;
  pictureUrl?: string;
  branchSlug?: string;
  points?: number;
  suspended?: boolean;
  createdAt: number;
  updatedAt?: number;
}) {
  return {
    ...user,
    points: user.points ?? 0,
    suspended: user.suspended ?? false,
  };
}

export const me = query({
  args: {},
  returns: v.union(userPublic, v.null()),
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    return user ? toUserPublic(user) : null;
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
      points: 0,
      suspended: false,
      createdAt: now,
    });
  },
});

export const requireMe = query({
  args: {},
  returns: userPublic,
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return toUserPublic(user);
  },
});
