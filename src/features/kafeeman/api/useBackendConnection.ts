import { useEffect, useRef } from 'react';

import { isApiEnabled } from './client';
import { useSafeMode } from './SafeModeProvider';
import { useBackendReady } from './useBackendStatus';

/** Reports backend reachability once on mount, so the app can toast the reason. */
export function useBackendConnection(onError?: (message: string) => void) {
  const offline = useSafeMode();
  const { ping, ready, pending, error } = useBackendReady();
  const reported = useRef(false);

  useEffect(() => {
    if (!isApiEnabled || pending || reported.current) return;

    if (offline) {
      reported.current = true;
      onError?.('Using offline menu — start the API with bun run api.');
      return;
    }

    if (ping?.ok && !ready) {
      reported.current = true;
      onError?.('Cloud menu not synced yet. Run: bun run db:seed in backend/');
      return;
    }

    if (ping?.ok) {
      reported.current = true;
      return;
    }

    if (error) {
      reported.current = true;
      onError?.('Could not reach the Kafe Eman API. Check your connection.');
    }
  }, [error, offline, onError, ping, pending, ready]);
}

export function BackendConnectionCheck({ onError }: { onError?: (message: string) => void }) {
  useBackendConnection(onError);
  return null;
}
