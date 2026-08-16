import { useAuth } from '@clerk/expo';

import { isClerkEnabled } from '../auth/clerkConfig';
import { isApiEnabled } from './client';
import { useSafeMode } from './SafeModeProvider';
import { useApiQuery } from './useApiQuery';
import type { ApiHealth } from './types';

/** Minimum API version that includes the catalog + customer order endpoints. */
export const BACKEND_VERSION = 2;

/**
 * True when the API is configured AND the deployment actually serves the
 * catalog/orders endpoints. The version gate stops the app breaking against a
 * backend older than the client.
 */
export function useBackendReady() {
  const safeMode = useSafeMode();
  const enabled = isApiEnabled && !safeMode;

  const { data: ping, error } = useApiQuery<ApiHealth>(enabled ? '/health' : null);

  const ready =
    enabled &&
    ping !== undefined &&
    ping.ok &&
    (ping.version ?? 0) >= BACKEND_VERSION &&
    (ping.catalogReady ?? false);

  const pending = enabled && ping === undefined && !error;

  return { ping, ready, pending, safeMode, error };
}

/** True when signed in and the backend is usable — gates all authenticated reads. */
export function useLiveBackend(isLoggedIn: boolean): boolean {
  const { isSignedIn } = useAuth();
  const { ready } = useBackendReady();
  return Boolean(ready && isClerkEnabled && isLoggedIn && isSignedIn);
}
