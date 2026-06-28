import { internalMutation, mutation, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { hashPassword } from './lib/password';

async function ensureDefaultAdmin(ctx: MutationCtx) {
  const username = 'admin';
  const existing = await ctx.db
    .query('admins')
    .withIndex('by_username', (q) => q.eq('username', username))
    .unique();

  if (existing) return { adminSeeded: false };

  const { hash, salt } = await hashPassword('admin123');
  const now = Date.now();
  await ctx.db.insert('admins', {
    username,
    passwordHash: hash,
    passwordSalt: salt,
    displayName: 'Admin',
    email: 'admin@kafe-eman.local',
    role: 'superadmin',
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  return { adminSeeded: true };
}

async function runSeedHandler(ctx: MutationCtx) {
    const adminResult = await ensureDefaultAdmin(ctx);

    const existingBranch = await ctx.db.query('branches').first();
    if (existingBranch) {
      return {
        seeded: false,
        ...adminResult,
        branches: 0,
        menuItems: 0,
        promos: 0,
        orders: 0,
      };
    }

    const now = Date.now();
    const branchRows = [
      {
        slug: 'alor-setar',
        label: 'Alor Setar',
        address: 'Jalan Tunku Ibrahim, 05000 Alor Setar, Kedah',
        hours: 'Open until 10 PM',
        imageUrl:
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop&auto=format',
        lat: 6.1248,
        lng: 100.3678,
        active: true,
        sortOrder: 1,
      },
      {
        slug: 'penang',
        label: 'Penang',
        address: 'Lebuh Chulia, Georgetown, 10300 Penang',
        hours: 'Open until 11 PM',
        imageUrl:
          'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=200&fit=crop&auto=format',
        lat: 5.4164,
        lng: 100.3327,
        active: true,
        sortOrder: 2,
      },
      {
        slug: 'kuala-lumpur',
        label: 'Kuala Lumpur',
        address: 'Bukit Bintang, 55100 Kuala Lumpur',
        hours: 'Open until 12 AM',
        imageUrl:
          'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=200&fit=crop&auto=format',
        lat: 3.1478,
        lng: 101.7103,
        active: true,
        sortOrder: 3,
      },
    ] as const;

    for (const b of branchRows) {
      await ctx.db.insert('branches', { ...b, createdAt: now, updatedAt: now });
    }

    const menuItems = [
      { legacyId: 1, name: 'Signature Latte', price: 14.9, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&auto=format', rating: 4.9, calories: 180, description: 'Velvety steamed milk over our signature double espresso, finished with a dusting of pure cocoa.', badge: 'Bestseller' },
      { legacyId: 2, name: 'Caramel Macchiato', price: 15.9, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=400&h=400&fit=crop&auto=format', rating: 4.8, calories: 240, description: 'Vanilla espresso layered beneath steamed milk with a caramel drizzle.' },
      { legacyId: 3, name: 'Cold Brew', price: 13.9, category: 'Cold Drinks', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&auto=format', rating: 4.7, calories: 90, description: 'Steeped cold for 20 hours. Smooth and never bitter.', badge: 'New' },
      { legacyId: 4, name: 'Matcha Latte', price: 15.5, category: 'Tea', imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop&auto=format', rating: 4.6, calories: 200, description: 'Ceremonial-grade matcha whisked with chilled oat milk.' },
      { legacyId: 5, name: 'Croissant', price: 8.5, category: 'Pastries', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop&auto=format', rating: 4.5, calories: 320, description: 'Buttery laminated dough, baked fresh every morning.' },
      { legacyId: 6, name: 'Iced Americano', price: 11.9, category: 'Cold Drinks', imageUrl: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=400&fit=crop&auto=format', rating: 4.7, calories: 15, description: 'Double ristretto over hand-cracked ice.' },
      { legacyId: 7, name: 'Flat White', price: 13.9, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=400&fit=crop&auto=format', rating: 4.8, calories: 150, description: 'Two ristretto shots with velvety micro-foam milk.' },
      { legacyId: 8, name: 'Strawberry Frappe', price: 17.9, category: 'Ice Blended', imageUrl: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=400&fit=crop&auto=format', rating: 4.6, calories: 380, description: 'Real strawberries blended with cream and whipped topping.', badge: 'Seasonal' },
      { legacyId: 9, name: 'Avocado Toast', price: 19.9, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&h=400&fit=crop&auto=format', rating: 4.5, calories: 290, description: 'Sourdough with smashed Hass avocado and poached egg.' },
      { legacyId: 10, name: 'Chocolate Tart', price: 12.9, category: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&auto=format', rating: 4.9, calories: 410, description: '72% dark chocolate ganache in a hand-pressed butter crust.', badge: "Chef's Pick" },
    ] as const;

    let sort = 1;
    for (const item of menuItems) {
      await ctx.db.insert('menuItems', {
        ...item,
        active: true,
        sortOrder: sort++,
        createdAt: now,
        updatedAt: now,
      });
    }

    const promos = [
      { title: 'Buy 1 Free 1', subtitle: 'Every Tuesday on all lattes', code: 'BOGO50', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop&auto=format', active: true, sortOrder: 1 },
      { title: 'Birthday Month', subtitle: 'Free drink on your birthday', code: 'WELCOME10', imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=400&fit=crop&auto=format', active: true, sortOrder: 2 },
      { title: 'Earn 2× Points', subtitle: 'This weekend only', code: 'KEAMAN15', imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=400&fit=crop&auto=format', active: true, sortOrder: 3 },
    ] as const;

    for (const p of promos) {
      await ctx.db.insert('promos', { ...p, createdAt: now, updatedAt: now });
    }

    await ctx.db.insert('orders', {
      orderNumber: 'KE-20250624-9102',
      branchSlug: 'kuala-lumpur',
      branchLabel: 'Kuala Lumpur',
      orderType: 'delivery',
      payMethod: 'tng',
      status: 'active',
      trackingStep: 2,
      items: [
        { menuItemId: 1, name: 'Signature Latte', price: 14.9, qty: 2, sugar: '50%', ice: 'Full Ice' },
      ],
      subtotal: 29.8,
      discount: 0,
      deliveryFee: 3,
      total: 32.8,
      pointsEarned: 33,
      orderNote: 'Less ice on both lattes, please leave at guard house.',
      createdAt: now - 1000 * 60 * 18,
      updatedAt: now,
    });

    await ctx.db.insert('orders', {
      orderNumber: 'KE-20250626-1188',
      branchSlug: 'penang',
      branchLabel: 'Penang',
      orderType: 'pickup',
      payMethod: 'card',
      status: 'active',
      trackingStep: 1,
      items: [
        { menuItemId: 4, name: 'Matcha Latte', price: 15.5, qty: 1, sugar: '50%', ice: 'Less Ice' },
      ],
      subtotal: 15.5,
      discount: 0,
      deliveryFee: 0,
      total: 15.5,
      pointsEarned: 16,
      orderNote: 'Extra hot matcha, no straw.',
      createdAt: now - 1000 * 60 * 8,
      updatedAt: now,
    });

    await ctx.db.insert('orders', {
      orderNumber: 'KE-20250620-4821',
      branchSlug: 'kuala-lumpur',
      branchLabel: 'Kuala Lumpur',
      orderType: 'delivery',
      payMethod: 'card',
      status: 'delivered',
      trackingStep: 3,
      items: [
        { menuItemId: 3, name: 'Cold Brew', price: 13.9, qty: 1, sugar: '0%', ice: 'Less Ice' },
      ],
      subtotal: 13.9,
      discount: 0,
      deliveryFee: 3,
      total: 16.9,
      pointsEarned: 17,
      createdAt: now - 1000 * 60 * 60 * 24 * 4,
      updatedAt: now,
    });

    return {
      seeded: true,
      ...adminResult,
      branches: branchRows.length,
      menuItems: menuItems.length,
      promos: promos.length,
      orders: 3,
    };
}

const seedReturns = v.object({
  seeded: v.boolean(),
  adminSeeded: v.boolean(),
  branches: v.number(),
  menuItems: v.number(),
  promos: v.number(),
  orders: v.number(),
});

export const seed = internalMutation({
  args: {},
  returns: seedReturns,
  handler: runSeedHandler,
});

/** Dev-only: `bun run convex:seed` */
export const runDev = mutation({
  args: {},
  returns: seedReturns,
  handler: runSeedHandler,
});
