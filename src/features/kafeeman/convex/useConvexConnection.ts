import { useQuery } from 'convex/react';
import { useEffect, useRef } from 'react';

import { api } from '@/convex/_generated/api';

import { isConvexEnabled } from './ConvexClientProvider';

/** Verifies Convex deployment is reachable (runs once on mount). */
export function useConvexConnection(onError?: (message: string) => void) {
  const ping = useQuery(api.health.ping, isConvexEnabled ? {} : 'skip');
  const reported = useRef(false);

  useEffect(() => {
    if (!isConvexEnabled || ping === undefined || reported.current) return;

    if (ping?.ok) {
      reported.current = true;
      return;
    }

    reported.current = true;
    onError?.('Could not reach the Kafe Eman cloud backend. Check your connection.');
  }, [onError, ping]);
}

export function ConvexConnectionCheck({ onError }: { onError?: (message: string) => void }) {
  useConvexConnection(onError);
  return null;
}
