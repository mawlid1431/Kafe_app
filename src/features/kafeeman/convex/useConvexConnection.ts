import { useEffect, useRef } from 'react';

import { isConvexEnabled } from './ConvexClientProvider';
import { useConvexSafeMode } from './ConvexSafeProvider';
import { useConvexBackendReady } from './useConvexBackendStatus';

/** Verifies Convex deployment is reachable (runs once on mount). */
export function useConvexConnection(onError?: (message: string) => void) {
  const offline = useConvexSafeMode();
  const { ping, ready, pending } = useConvexBackendReady();
  const reported = useRef(false);

  useEffect(() => {
    if (!isConvexEnabled || pending || reported.current) return;

    if (offline) {
      reported.current = true;
      onError?.('Using offline menu — run bun run convex:dev to sync branches.');
      return;
    }

    if (ping?.ok && !ready) {
      reported.current = true;
      onError?.('Cloud menu not synced yet. Run: bun run convex:dev then bun run convex:seed');
      return;
    }

    if (ping?.ok) {
      reported.current = true;
      return;
    }

    reported.current = true;
    onError?.('Could not reach the Kafe Eman cloud backend. Check your connection.');
  }, [offline, onError, ping, pending, ready]);
}

export function ConvexConnectionCheck({ onError }: { onError?: (message: string) => void }) {
  useConvexConnection(onError);
  return null;
}
