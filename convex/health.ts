import { v } from 'convex/values';

import { query } from './_generated/server';

/** Public ping — verifies the app can reach this Convex deployment. */
export const ping = query({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    deployment: v.string(),
    timestamp: v.number(),
  }),
  handler: async () => {
    return {
      ok: true as const,
      deployment: 'unique-seal-371',
      timestamp: Date.now(),
    };
  },
});
