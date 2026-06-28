import { useQuery } from 'convex/react';
import { useMemo } from 'react';

import { api } from '@/convex/_generated/api';
import { CATEGORIES as FALLBACK_CATEGORIES, MENU as FALLBACK_MENU, PROMOS as FALLBACK_PROMOS, BRANCHES as FALLBACK_BRANCHES } from '../data';
import type { MenuItem } from '../types';
import { isConvexEnabled } from './ConvexClientProvider';
import { toAppBranch, toMenuItem, toPromoBanner, type AppBranch } from './adapters';

/** Live menu, branches, promos from Convex — falls back to local seed when offline. */
export function useConvexCatalog(enabled = isConvexEnabled) {
  const branchesRaw = useQuery(api.catalog.listBranches, enabled ? {} : 'skip');
  const menuRaw = useQuery(api.catalog.listMenu, enabled ? {} : 'skip');
  const categoriesRaw = useQuery(api.catalog.listCategories, enabled ? {} : 'skip');
  const promosRaw = useQuery(api.catalog.listPromos, enabled ? {} : 'skip');

  const branches = useMemo((): AppBranch[] => {
    if (!enabled || branchesRaw === undefined) {
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
  }, [enabled, branchesRaw]);

  const menu = useMemo((): MenuItem[] => {
    if (!enabled || menuRaw === undefined) return FALLBACK_MENU;
    return menuRaw.map((row, i) => toMenuItem(row, i + 1));
  }, [enabled, menuRaw]);

  const categories = useMemo(() => {
    if (!enabled || categoriesRaw === undefined) return [...FALLBACK_CATEGORIES];
    return categoriesRaw;
  }, [enabled, categoriesRaw]);

  const promos = useMemo(() => {
    if (!enabled || promosRaw === undefined) return FALLBACK_PROMOS;
    return promosRaw.map(toPromoBanner);
  }, [enabled, promosRaw]);

  const ready = !enabled || (branchesRaw !== undefined && menuRaw !== undefined);

  return { branches, menu, categories, promos, ready, isLive: enabled && ready };
}
