import { useCallback, useMemo } from 'react';

import type { MenuItem, OrderRecord } from '../types';
import { apiFetch } from './client';
import { branchSlugForName, toOrderRecord, type AppBranch } from './adapters';
import { POLL, useApiQuery } from './useApiQuery';
import type { ApiOrder, ApiUser, CreateOrderInput, CreateOrderResult } from './types';

export { useLiveBackend, useBackendReady } from './useBackendStatus';

/**
 * Customer orders.
 *
 * The tracking screen must reflect an admin advancing a step. REST cannot
 * push, so the list is polled while the hook is mounted.
 */
export function useOrders(enabled: boolean, menu: MenuItem[]) {
  const { data: raw, refetch } = useApiQuery<ApiOrder[]>(enabled ? '/orders' : null, {
    auth: true,
    refetchInterval: POLL.orders,
  });

  const orders: OrderRecord[] | undefined = useMemo(() => {
    if (!enabled || raw === undefined) return undefined;
    return raw.map((o) => toOrderRecord(o, menu));
  }, [enabled, raw, menu]);

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<CreateOrderResult> => {
      const result = await apiFetch<CreateOrderResult>('/orders', {
        method: 'POST',
        body: input,
        auth: true,
      });
      refetch();
      return result;
    },
    [refetch],
  );

  const cancelOrder = useCallback(
    async (input: { orderNumber: string }): Promise<void> => {
      await apiFetch<void>(`/orders/${encodeURIComponent(input.orderNumber)}/cancel`, {
        method: 'POST',
        auth: true,
      });
      refetch();
    },
    [refetch],
  );

  return { orders, createOrder, cancelOrder, loading: enabled && raw === undefined, refetch };
}

/** Signed-in customer's points balance and suspension state. */
export function useCurrentUser(enabled: boolean) {
  const { data: me } = useApiQuery<ApiUser | null>(enabled ? '/users/me' : null, { auth: true });
  return {
    points: me?.points,
    suspended: me?.suspended ?? false,
    loading: enabled && me === undefined,
  };
}

export function resolveBranchSlug(branches: AppBranch[], branchName: string): string {
  return branchSlugForName(branches, branchName) ?? branchName.toLowerCase().replace(/\s+/g, '-');
}
