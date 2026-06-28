import { useQuery } from 'convex/react';
import { useMemo } from 'react';

import { api } from '@/convex/_generated/api';
import { CATEGORIES as FALLBACK_CATEGORIES, MENU as FALLBACK_MENU, PROMOS as FALLBACK_PROMOS, BRANCHES as FALLBACK_BRANCHES } from '../data';
import type { MenuItem } from '../types';
import { isConvexEnabled } from './ConvexClientProvider';
import { useConvexSafeMode } from './ConvexSafeProvider';
import { useConvexBackendReady } from './useConvexBackendStatus';
import { toAppBranch, toMenuItem, toPromoBanner, type AppBranch } from './adapters';

/** Live menu, branches, promos from Convex — falls back to local seed when offline or backend not deployed. */
export function useConvexCatalog() {
  const safeMode = useConvexSafeMode();
  const { ready: backendReady } = useConvexBackendReady();
  const useLiveCatalog = isConvexEnabled && backendReady && !safeMode;

  const branchesRaw = useQuery(api.catalog.listBranches, useLiveCatalog ? {} : 'skip');
  const menuRaw = useQuery(api.catalog.listMenu, useLiveCatalog ? {} : 'skip');
  const categoriesRaw = useQuery(api.catalog.listCategories, useLiveCatalog ? {} : 'skip');
  const promosRaw = useQuery(api.catalog.listPromos, useLiveCatalog ? {} : 'skip');

  const branches = useMemo((): AppBranch[] => {
    if (!useLiveCatalog || branchesRaw === undefined) {
      return FALLBACK_BRANCHES.map((b) => ({
        name: b.name,
        slug: b.name.toLowerCase().replace(/\s+/g, '-'),
        addr: b.addr,
        time: b.time,
        img: b.img,
        lat: b.lat,
        lng: b.lng,
      }));
    }
    return branchesRaw.map(toAppBranch);
  }, [useLiveCatalog, branchesRaw]);

  const menu = useMemo((): MenuItem[] => {
    if (!useLiveCatalog || menuRaw === undefined) return FALLBACK_MENU;
    return menuRaw.map((row, i) => toMenuItem(row, i + 1));
  }, [useLiveCatalog, menuRaw]);

  const categories = useMemo(() => {
    if (!useLiveCatalog || categoriesRaw === undefined) return [...FALLBACK_CATEGORIES];
    return categoriesRaw;
  }, [useLiveCatalog, categoriesRaw]);

  const promos = useMemo(() => {
    if (!useLiveCatalog || promosRaw === undefined) return FALLBACK_PROMOS;
    return promosRaw.map(toPromoBanner);
  }, [useLiveCatalog, promosRaw]);

  const ready = !isConvexEnabled || !backendReady || (branchesRaw !== undefined && menuRaw !== undefined);

  return { branches, menu, categories, promos, ready, isLive: useLiveCatalog && ready };
}
