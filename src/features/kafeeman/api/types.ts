/**
 * Shapes returned by the Kafe Eman REST API.
 *
 * Timestamps are epoch milliseconds and money is a plain number — the API
 * normalises Prisma's Date and Decimal at the edge.
 */

export type ApiBranch = {
  slug: string;
  label: string;
  address: string;
  hours: string;
  imageUrl?: string;
  lat: number;
  lng: number;
};

export type ApiMenuItem = {
  legacyId?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating?: number;
  calories?: number;
  badge?: string;
};

export type ApiPromo = {
  title: string;
  subtitle: string;
  code: string;
  imageUrl?: string;
  discountPercent?: number;
  fixedOff?: number;
  minSpend?: number;
};

export type ApiOrderLine = {
  menuItemId?: number;
  name: string;
  price: number;
  qty: number;
  sugar?: string;
  ice?: string;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  branchLabel: string;
  orderType: 'delivery' | 'pickup';
  payMethod: 'tng' | 'card' | 'banking';
  status: 'active' | 'delivered' | 'cancelled';
  trackingStep: number;
  items: ApiOrderLine[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string;
  pointsEarned: number;
  pointsRedeemed: number;
  orderNote?: string;
  createdAt: number;
  updatedAt: number;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  pictureUrl?: string;
  branchSlug?: string;
  points: number;
  suspended: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ApiHealth = {
  ok: true;
  service: string;
  version: number;
  catalogReady: boolean;
};

export type CreateOrderInput = {
  branchSlug: string;
  orderType: 'delivery' | 'pickup';
  payMethod: 'tng' | 'card' | 'banking';
  items: { menuItemId?: number; name: string; qty: number; sugar?: string; ice?: string }[];
  promoCode?: string;
  pointsToRedeem?: number;
  orderNote?: string;
};

export type CreateOrderResult = {
  orderId: string;
  orderNumber: string;
  total: number;
  pointsEarned: number;
};
