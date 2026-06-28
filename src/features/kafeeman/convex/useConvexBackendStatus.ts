import { useAuth } from '@clerk/expo';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { isClerkEnabled } from '../auth/clerkConfig';
import { isConvexEnabled } from './ConvexClientProvider';
import { useConvexSafeMode } from './ConvexSafeProvider';

/** Minimum Convex backend version that includes catalog + customer orders APIs. */
export const CONVEX_BACKEND_VERSION = 2;

/**
 * True when Convex is configured AND the deployed backend includes catalog/orders.
 * Prevents crashes when cloud deployment is behind local code.
 */
export function useConvexBackendReady() {
  const safeMode = useConvexSafeMode();
  const ping = useQuery(api.health.ping, isConvexEnabled && !safeMode ? {} : 'skip');
  const ready =
    !safeMode &&
    isConvexEnabled &&
    ping !== undefined &&
    ping.ok &&
    (ping.version ?? 0) >= CONVEX_BACKEND_VERSION &&
    (ping.catalogReady ?? false);
  const pending = isConvexEnabled && !safeMode && ping === undefined;
  return { ping, ready, pending, safeMode };
}

export function useLiveBackend(isLoggedIn: boolean): boolean {
  const { isSignedIn } = useAuth();
  const { ready } = useConvexBackendReady();
  return Boolean(ready && isClerkEnabled && isLoggedIn && isSignedIn);
}
