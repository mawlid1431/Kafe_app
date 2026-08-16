import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Tag,
  Gift,
  Users,
  Bell,
  Shield,
  UserRound,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type AdminNavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
};

export type AdminNavSection = {
  title?: string;
  items: AdminNavItem[];
};

/** Base path the whole admin app is mounted under. `/` is the public landing page. */
export const ADMIN_BASE = '/admin';

/** Builds an absolute admin path from a section-relative one. */
export function adminPath(path = ''): string {
  const clean = path.replace(/^\/+/, '');
  return clean ? `${ADMIN_BASE}/${clean}` : ADMIN_BASE;
}

export const ADMIN_NAV_MAIN: AdminNavItem[] = [
  { label: 'Dashboard', to: adminPath(), icon: LayoutDashboard },
  { label: 'Branches', to: adminPath('branches'), icon: Store },
  { label: 'Menu', to: adminPath('menu'), icon: UtensilsCrossed },
  { label: 'Orders', to: adminPath('orders'), icon: ShoppingBag },
  { label: 'Promos', to: adminPath('promos'), icon: Tag },
  { label: 'Rewards', to: adminPath('rewards'), icon: Gift },
  { label: 'Users', to: adminPath('customers'), icon: Users },
  { label: 'Notifications', to: adminPath('notifications'), icon: Bell },
];

export const ADMIN_NAV_PEOPLE: AdminNavItem[] = [
  { label: 'Staff', to: adminPath('staff'), icon: Shield },
];

export const ADMIN_NAV_ACCOUNT: AdminNavItem[] = [
  { label: 'My account', to: adminPath('account'), icon: UserRound },
];

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  { items: ADMIN_NAV_MAIN },
  { title: 'Team', items: ADMIN_NAV_PEOPLE },
  { title: 'Account', items: ADMIN_NAV_ACCOUNT },
];

const ALL_NAV_ITEMS: AdminNavItem[] = [
  ...ADMIN_NAV_MAIN,
  ...ADMIN_NAV_PEOPLE,
  ...ADMIN_NAV_ACCOUNT,
];

/**
 * Resolves a browser-tab title for an admin path, e.g.
 * `/admin/orders/track` → "Orders · Kafe Eman Admin". Picks the
 * longest matching nav path so nested routes resolve to their section.
 */
export function adminTitleForPath(pathname: string): string {
  const match = ALL_NAV_ITEMS.filter(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  ).sort((a, b) => b.to.length - a.to.length)[0];

  return match ? `${match.label} · Kafe Eman Admin` : 'Kafe Eman Admin';
}
