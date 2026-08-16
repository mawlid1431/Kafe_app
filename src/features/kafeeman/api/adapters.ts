import type { MenuItem, OrderRecord } from '../types';
import type { ApiOrder, ApiOrderLine } from './types';

export type AppBranch = {
  name: string;
  slug: string;
  addr: string;
  time: string;
  img: string;
  lat: number;
  lng: number;
};

export type ApiBranchRow = {
  slug: string;
  label: string;
  address: string;
  hours: string;
  imageUrl?: string;
  lat: number;
  lng: number;
};

export type ApiPromoBanner = {
  title: string;
  subtitle: string;
  code: string;
  imageUrl?: string;
  discountPercent?: number;
  fixedOff?: number;
  minSpend?: number;
};

export function toAppBranch(b: ApiBranchRow): AppBranch {
  return {
    name: b.label,
    slug: b.slug,
    addr: b.address,
    time: b.hours,
    img: b.imageUrl ?? '',
    lat: b.lat,
    lng: b.lng,
  };
}

export function toMenuItem(
  row: {
    legacyId?: number;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    rating?: number;
    calories?: number;
    badge?: string;
  },
  fallbackId: number,
): MenuItem {
  return {
    id: row.legacyId ?? fallbackId,
    name: row.name,
    price: row.price,
    category: row.category,
    image: row.imageUrl,
    rating: row.rating ?? 4.5,
    calories: row.calories ?? 0,
    description: row.description,
    badge: row.badge,
  };
}

export function branchSlugForName(branches: AppBranch[], branchName: string): string | null {
  const hit = branches.find((b) => b.name === branchName);
  return hit?.slug ?? null;
}

function lineToMenuItem(line: ApiOrderLine, menuById: Map<number, MenuItem>): MenuItem {
  if (line.menuItemId !== undefined) {
    const found = menuById.get(line.menuItemId);
    if (found) return found;
  }
  // The item was deleted from the menu — fall back to the order's own snapshot.
  return {
    id: line.menuItemId ?? 0,
    name: line.name,
    price: line.price,
    category: 'Coffee',
    image: '',
    rating: 4.5,
    calories: 0,
    description: line.name,
  };
}

export function toOrderRecord(order: ApiOrder, menu: MenuItem[]): OrderRecord {
  const menuById = new Map(menu.map((m) => [m.id, m]));
  return {
    id: order.orderNumber,
    items: order.items.map((line) => ({
      item: lineToMenuItem(line, menuById),
      qty: line.qty,
      sugar: line.sugar ?? '50%',
      ice: line.ice ?? 'Full Ice',
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    total: order.total,
    status: order.status,
    trackingStep: order.trackingStep,
    branch: order.branchLabel,
    orderType: order.orderType,
    payMethod: order.payMethod,
    createdAt: order.createdAt,
    pointsEarned: order.pointsEarned ?? 0,
    pointsRedeemed: order.pointsRedeemed,
    orderNote: order.orderNote,
  };
}

export function toPromoBanner(p: ApiPromoBanner, index: number) {
  return {
    id: index + 1,
    title: p.title,
    sub: p.subtitle,
    img: p.imageUrl ?? '',
    code: p.code,
  };
}
