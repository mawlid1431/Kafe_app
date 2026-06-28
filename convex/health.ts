import { v } from 'convex/values';

import { query } from './_generated/server';

/** Public ping — verifies the app can reach this Convex deployment. */
export const ping = query({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    deployment: v.string(),
    /** Bump when new public APIs (catalog, orders) are deployed. */
    version: v.number(),
    /** True when branches table is readable (catalog is usable). */
    catalogReady: v.boolean(),
  }),
  handler: async (ctx) => {
    let catalogReady = false;
    try {
      await ctx.db.query('branches').first();
      catalogReady = true;
    } catch {
      catalogReady = false;
    }

    return {
      ok: true as const,
      deployment: 'unique-seal-371',
      version: 2,
      catalogReady,
    };
  },
});
