import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { apiFetch, isApiEnabled } from './client';

/**
 * Query hook over REST.
 *
 * There is no push channel, so freshness comes from an on-mount fetch, an
 * optional poll, and a refetch whenever the app returns to the foreground:
 *
 *   undefined → loading (or skipped)
 *   T         → data
 *
 * Screens branch on `undefined` to render their loading state, so that
 * convention is part of the contract.
 */

export type ApiQueryOptions = {
  /** Send the Clerk bearer token. */
  auth?: boolean;
  /** Poll interval in ms — used by screens that must feel live. */
  refetchInterval?: number;
};

/** Poll cadences, chosen per screen. */
export const POLL = {
  /** Order tracking: an admin advancing a step should appear promptly. */
  orders: 5_000,
} as const;

export type ApiQueryResult<T> = {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
};

export function useApiQuery<T>(
  path: string | null,
  options: ApiQueryOptions = {},
): ApiQueryResult<T> {
  const { auth = false, refetchInterval } = options;

  /**
   * State is stamped with the path it came from. Reading it back through a
   * path comparison means a changed or skipped path reports "loading" without
   * a synchronous setState in the effect body, which would cost an extra
   * render pass on every navigation.
   */
  const [state, setState] = useState<{
    path: string | null;
    data: T | undefined;
    error: Error | null;
  }>({ path: null, data: undefined, error: null });

  // Written in the effect, never during render.
  const pathRef = useRef<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(
    async (target: string) => {
      if (!isApiEnabled) return;

      try {
        const result = await apiFetch<T>(target, { auth });
        // Discard a response that arrived after the caller moved on.
        if (mounted.current && pathRef.current === target) {
          setState({ path: target, data: result, error: null });
        }
      } catch (err) {
        if (mounted.current && pathRef.current === target) {
          setState({
            path: target,
            data: undefined,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    },
    [auth],
  );

  useEffect(() => {
    mounted.current = true;
    pathRef.current = path;

    if (!path) {
      return () => {
        mounted.current = false;
      };
    }

    // The rule cannot see that `load` only calls setState after an await, which
    // is the intended fetch-on-mount, not a synchronous render-phase update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(path);

    const timer = refetchInterval ? setInterval(() => void load(path), refetchInterval) : undefined;

    // Catch up on anything missed while the app was backgrounded.
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') void load(path);
    });

    return () => {
      mounted.current = false;
      if (timer) clearInterval(timer);
      subscription.remove();
    };
  }, [path, refetchInterval, load]);

  const refetch = useCallback(() => {
    const current = pathRef.current;
    if (current) void load(current);
  }, [load]);

  const fresh = state.path === path;
  const data = fresh ? state.data : undefined;
  const error = fresh ? state.error : null;

  return { data, error, loading: Boolean(path) && data === undefined && !error, refetch };
}
