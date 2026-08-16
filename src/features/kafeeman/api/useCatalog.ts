import { useMemo } from 'react';

import {
  BRANCHES as FALLBACK_BRANCHES,
  CATEGORIES as FALLBACK_CATEGORIES,
  MENU as FALLBACK_MENU,
  PROMOS as FALLBACK_PROMOS,
} from '../data';
import type { MenuItem } from '../types';
import { isApiEnabled } from './client';
import { useSafeMode } from './SafeModeProvider';
import { useBackendReady } from './useBackendStatus';
import { useApiQuery } from './useApiQuery';
import { toAppBranch, toMenuItem, toPromoBanner, type AppBranch } from './adapters';
import type { ApiBranch, ApiMenuItem, ApiPromo } from './types';

/**
 * Live menu, branches and promos from the API, falling back to the bundled seed
 * data when offline or when the backend is not deployed.
 *
 * Returns bundled data and live data through one shape, so screens never have
 * to know which they are rendering.
 */
export function useCatalog() {
  const safeMode = useSafeMode();
  const { ready: backendReady } = useBackendReady();
  const useLiveCatalog = isApiEnabled && backendReady && !safeMode;

  const { data: branchesRaw } = useApiQuery<ApiBranch[]>(
    useLiveCatalog ? '/catalog/branches' : null,
  );
  const { data: menuRaw } = useApiQuery<ApiMenuItem[]>(useLiveCatalog ? '/catalog/menu' : null);
  const { data: categoriesRaw } = useApiQuery<string[]>(
    useLiveCatalog ? '/catalog/categories' : null,
  );
  const { data: promosRaw } = useApiQuery<ApiPromo[]>(useLiveCatalog ? '/catalog/promos' : null);

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

  const ready =
    !isApiEnabled || !backendReady || (branchesRaw !== undefined && menuRaw !== undefined);

  return { branches, menu, categories, promos, ready, isLive: useLiveCatalog && ready };
}
