import type { MenuItem, OrderRecord, OrderStatus, PointsActivity, RewardRedemption } from './types';

export const MENU: MenuItem[] = [
  { id: 1, name: 'Signature Latte', price: 14.9, category: 'Coffee', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&auto=format', rating: 4.9, calories: 180, description: 'Velvety steamed milk over our signature double espresso, finished with a dusting of pure cocoa.', badge: 'Bestseller' },
  { id: 2, name: 'Caramel Macchiato', price: 15.9, category: 'Coffee', image: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=400&h=400&fit=crop&auto=format', rating: 4.8, calories: 240, description: 'Vanilla espresso layered beneath steamed milk with a caramel drizzle.' },
  { id: 3, name: 'Cold Brew', price: 13.9, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&auto=format', rating: 4.7, calories: 90, description: 'Steeped cold for 20 hours. Smooth and never bitter.', badge: 'New' },
  { id: 4, name: 'Matcha Latte', price: 15.5, category: 'Tea', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop&auto=format', rating: 4.6, calories: 200, description: 'Ceremonial-grade matcha whisked with chilled oat milk.' },
  { id: 5, name: 'Croissant', price: 8.5, category: 'Pastries', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop&auto=format', rating: 4.5, calories: 320, description: 'Buttery laminated dough, baked fresh every morning.' },
  { id: 6, name: 'Iced Americano', price: 11.9, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=400&fit=crop&auto=format', rating: 4.7, calories: 15, description: 'Double ristretto over hand-cracked ice.' },
  { id: 7, name: 'Flat White', price: 13.9, category: 'Coffee', image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=400&fit=crop&auto=format', rating: 4.8, calories: 150, description: 'Two ristretto shots with velvety micro-foam milk.' },
  { id: 8, name: 'Strawberry Frappe', price: 17.9, category: 'Ice Blended', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=400&fit=crop&auto=format', rating: 4.6, calories: 380, description: 'Real strawberries blended with cream and whipped topping.', badge: 'Seasonal' },
  { id: 9, name: 'Avocado Toast', price: 19.9, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&h=400&fit=crop&auto=format', rating: 4.5, calories: 290, description: 'Sourdough with smashed Hass avocado and poached egg.' },
  { id: 10, name: 'Chocolate Tart', price: 12.9, category: 'Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&auto=format', rating: 4.9, calories: 410, description: '72% dark chocolate ganache in a hand-pressed butter crust.', badge: "Chef's Pick" },
];

export const CATEGORIES = ['All', 'Coffee', 'Tea', 'Cold Drinks', 'Ice Blended', 'Pastries', 'Desserts', 'Breakfast'];

export const PROMOS = [
  { id: 1, title: 'Buy 1 Free 1', sub: 'Every Tuesday on all lattes', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop&auto=format', code: 'BOGO50' },
  { id: 2, title: 'Birthday Month', sub: 'Free drink on your birthday', img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=400&fit=crop&auto=format', code: 'WELCOME10' },
  { id: 3, title: 'Earn 2× Points', sub: 'This weekend only', img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=400&fit=crop&auto=format', code: 'KEAMAN15' },
];

export const HOME_OFFERS = [
  { id: 'o1', tag: '20% OFF', title: 'First order', code: 'WELCOME10' },
  { id: 'o2', tag: 'FREE', title: 'Delivery', code: 'FREESHIP' },
  { id: 'o3', tag: 'RM 5', title: 'Drinks deal', code: 'BOGO50' },
];

export const REWARD_TIERS = [
  { name: 'Bronze', min: 0, max: 499, emoji: '🥉' },
  { name: 'Silver', min: 500, max: 1499, emoji: '🥈' },
  { name: 'Gold', min: 1500, max: 99999, emoji: '🥇' },
] as const;

export const REWARD_CATALOG: RewardRedemption[] = [
  { id: 'r1', title: 'Free Espresso', pointsCost: 300, description: 'Any single espresso drink', icon: 'cafe' },
  { id: 'r2', title: 'RM 10 Voucher', pointsCost: 800, description: 'Off your next order', icon: 'pricetag' },
  { id: 'r3', title: 'Free Pastry', pointsCost: 500, description: 'Croissant or tart of choice', icon: 'restaurant' },
  { id: 'r4', title: 'Birthday Drink', pointsCost: 0, description: 'Free on your birthday month', icon: 'gift' },
];

export const POINTS_HISTORY_SEED: PointsActivity[] = [
  { id: 'p1', label: 'Order KE-20250620-4821', delta: 32, date: 'Jun 20' },
  { id: 'p2', label: 'Redeemed Free Espresso', delta: -300, date: 'Jun 18' },
  { id: 'p3', label: 'Order KE-20250615-3310', delta: 28, date: 'Jun 15' },
  { id: 'p4', label: 'Weekend 2× bonus', delta: 45, date: 'Jun 14' },
];

export function createSeedOrders(): OrderRecord[] {
  const latte = MENU[0];
  const coldBrew = MENU[2];
  const croissant = MENU[4];
  return [
    {
      id: 'KE-20250624-9102',
      items: [{ item: latte, qty: 2, sugar: '50%', ice: 'Full Ice' }],
      subtotal: 29.8,
      discount: 0,
      deliveryFee: 3,
      total: 32.8,
      status: 'active',
      trackingStep: 2,
      branch: 'Kuala Lumpur',
      orderType: 'delivery',
      payMethod: 'tng',
      createdAt: Date.now() - 1000 * 60 * 18,
      pointsEarned: 33,
    },
    {
      id: 'KE-20250620-4821',
      items: [{ item: coldBrew, qty: 1, sugar: '0%', ice: 'Less Ice' }],
      subtotal: 13.9,
      discount: 1.39,
      deliveryFee: 3,
      total: 15.51,
      status: 'delivered',
      trackingStep: 3,
      branch: 'Penang',
      orderType: 'delivery',
      payMethod: 'card',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      pointsEarned: 16,
    },
    {
      id: 'KE-20250615-3310',
      items: [
        { item: croissant, qty: 2, sugar: '100%', ice: 'No Ice' },
        { item: latte, qty: 1, sugar: '25%', ice: 'Less Ice' },
      ],
      subtotal: 31.9,
      discount: 0,
      deliveryFee: 0,
      total: 31.9,
      status: 'delivered',
      trackingStep: 3,
      branch: 'Alor Setar',
      orderType: 'pickup',
      payMethod: 'tng',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
      pointsEarned: 32,
    },
  ];
}

export function orderStatusLabel(step: number, orderType: 'delivery' | 'pickup'): string {
  if (step >= 3) return orderType === 'pickup' ? 'Ready for pickup' : 'Delivered';
  if (step >= 2) return orderType === 'pickup' ? 'Ready soon' : 'On the way';
  if (step >= 1) return 'Preparing';
  return 'Order placed';
}

export function formatOrderDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}

export const BRANCHES = [
  { name: 'Alor Setar', addr: 'Jalan Tunku Ibrahim, 05000 Alor Setar, Kedah', time: 'Open until 10 PM', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop&auto=format', lat: 6.1248, lng: 100.3678 },
  { name: 'Penang', addr: 'Lebuh Chulia, Georgetown, 10300 Penang', time: 'Open until 11 PM', img: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=200&fit=crop&auto=format', lat: 5.4164, lng: 100.3327 },
  { name: 'Kuala Lumpur', addr: 'Bukit Bintang, 55100 Kuala Lumpur', time: 'Open until 12 AM', img: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=200&fit=crop&auto=format', lat: 3.1478, lng: 101.7103 },
] as const;

/** Demo customer pin — offset from branch for delivery tracking. */
export const DEMO_DELIVERY_DEST = { lat: 3.139, lng: 101.7069 } as const;

export const RIDER_CONTACT = {
  name: 'Ahmad',
  phone: '+60129876543',
  rating: 4.9,
} as const;

export const STATUS_ORDER: OrderStatus[] = ['placed', 'preparing', 'on-the-way', 'arrived'];

export const ORDER_STEPS = [
  { key: 'placed' as OrderStatus, label: 'Order Received', sub: 'Your order has been confirmed' },
  { key: 'preparing' as OrderStatus, label: 'Being Prepared', sub: 'Barista is crafting your drink' },
  { key: 'on-the-way' as OrderStatus, label: 'On The Way', sub: 'Rider is heading to you now' },
  { key: 'arrived' as OrderStatus, label: 'Delivered', sub: 'Enjoy your coffee! ☕' },
];

export type OnboardingSlideIcon = {
  icon: 'cafe' | 'delivery' | 'storefront' | 'reward';
  label?: string;
};

export const ONBOARDING_SLIDES: {
  icons: OnboardingSlideIcon[];
  title: string;
  sub: string;
  img: string;
}[] = [
  {
    icons: [{ icon: 'cafe' }],
    title: 'Order coffee easily',
    sub: 'Browse our full menu, customize every detail, and order in seconds.',
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=480&h=480&fit=crop&auto=format',
  },
  {
    icons: [
      { icon: 'delivery', label: 'Delivery' },
      { icon: 'storefront', label: 'Pickup' },
    ],
    title: 'Delivery or Pickup',
    sub: 'Get your favourite brew delivered hot or collect it ready at the branch.',
    img: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=480&h=480&fit=crop&auto=format',
  },
  {
    icons: [{ icon: 'reward' }],
    title: 'Earn Rewards',
    sub: 'Every order earns points. Unlock free drinks, discounts, and birthday gifts.',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=480&h=480&fit=crop&auto=format',
  },
];
