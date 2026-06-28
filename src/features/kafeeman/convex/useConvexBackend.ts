import { useMutation, useQuery } from 'convex/react';
import { useMemo } from 'react';

import { api } from '@/convex/_generated/api';
import { branchSlugForName, toOrderRecord, type AppBranch } from './adapters';
import type { MenuItem, OrderRecord } from '../types';

export { useLiveBackend, useConvexBackendReady } from './useConvexBackendStatus';

export function useConvexOrders(enabled: boolean, menu: MenuItem[]) {
  const raw = useQuery(api.orders.listMine, enabled ? {} : 'skip');
  const createOrder = useMutation(api.orders.create);
  const cancelOrder = useMutation(api.orders.cancelMine);

  const orders: OrderRecord[] | undefined = useMemo(() => {
    if (!enabled || raw === undefined) return undefined;
    return raw.map((o) => toOrderRecord(o, menu));
  }, [enabled, raw, menu]);

  return { orders, createOrder, cancelOrder, loading: enabled && raw === undefined };
}

export function useConvexUser(enabled: boolean) {
  const me = useQuery(api.users.me, enabled ? {} : 'skip');
  return {
    points: me?.points,
    suspended: me?.suspended ?? false,
    loading: enabled && me === undefined,
  };
}

export function resolveBranchSlug(branches: AppBranch[], branchName: string): string {
  return branchSlugForName(branches, branchName) ?? branchName.toLowerCase().replace(/\s+/g, '-');
}
