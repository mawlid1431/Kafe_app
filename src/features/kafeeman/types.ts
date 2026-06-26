export type Screen =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'signup'
  | 'otp'
  | 'profile-setup'
  | 'branch'
  | 'order-type'
  | 'home'
  | 'menu'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'payment-card'
  | 'payment-tng'
  | 'order-success'
  | 'order-tracking'
  | 'orders'
  | 'profile'
  | 'rewards'
  | 'favorites';

export type TabKey = 'home' | 'menu' | 'cart' | 'orders' | 'profile';

export type OrderStatus = 'placed' | 'preparing' | 'on-the-way' | 'arrived';

export type OrderLifecycle = 'active' | 'delivered' | 'cancelled';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  calories: number;
  description: string;
  badge?: string;
}

export interface CartLine {
  item: MenuItem;
  qty: number;
  sugar: string;
  ice: string;
}

export interface OrderRecord {
  id: string;
  items: CartLine[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderLifecycle;
  trackingStep: number;
  branch: string;
  orderType: 'delivery' | 'pickup';
  payMethod: 'tng' | 'card' | 'banking';
  createdAt: number;
  pointsEarned: number;
}

export interface RewardRedemption {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  icon: string;
}

export interface PointsActivity {
  id: string;
  label: string;
  delta: number;
  date: string;
}
