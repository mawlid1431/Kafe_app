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

export const ADMIN_NAV_MAIN: AdminNavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Branches', to: '/branches', icon: Store },
  { label: 'Menu', to: '/menu', icon: UtensilsCrossed },
  { label: 'Orders', to: '/orders', icon: ShoppingBag },
  { label: 'Promos', to: '/promos', icon: Tag },
  { label: 'Rewards', to: '/rewards', icon: Gift },
  { label: 'Users', to: '/customers', icon: Users },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

export const ADMIN_NAV_PEOPLE: AdminNavItem[] = [
  { label: 'Staff', to: '/staff', icon: Shield },
];

export const ADMIN_NAV_ACCOUNT: AdminNavItem[] = [
  { label: 'My account', to: '/account', icon: UserRound },
];

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  { items: ADMIN_NAV_MAIN },
  { title: 'Team', items: ADMIN_NAV_PEOPLE },
  { title: 'Account', items: ADMIN_NAV_ACCOUNT },
];
