/**
 * Database seed.
 *
 * Idempotent: creates the default superadmin if missing, and skips catalog
 * seeding entirely once any branch exists. Safe to re-run.
 *
 *   bun run seed
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { hashPassword } from '../src/auth/admin/password.util';

const prisma = new PrismaClient();

const money = (n: number) => new Prisma.Decimal(n.toFixed(2));

const BRANCHES = [
  {
    slug: 'alor-setar',
    label: 'Alor Setar',
    address: 'Jalan Tunku Ibrahim, 05000 Alor Setar, Kedah',
    hours: 'Open until 10 PM',
    imageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop&auto=format',
    lat: 6.1248,
    lng: 100.3678,
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
    sortOrder: 3,
  },
];

const MENU_ITEMS = [
  { legacyId: 1, name: 'Signature Latte', price: 14.9, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&auto=format', rating: 4.9, calories: 180, description: 'Velvety steamed milk over our signature double espresso, finished with a dusting of pure cocoa.', badge: 'Bestseller' },
  { legacyId: 2, name: 'Caramel Macchiato', price: 15.9, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=400&h=400&fit=crop&auto=format', rating: 4.8, calories: 240, description: 'Vanilla espresso layered beneath steamed milk with a caramel drizzle.', badge: null },
  { legacyId: 3, name: 'Cold Brew', price: 13.9, category: 'Cold Drinks', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&auto=format', rating: 4.7, calories: 90, description: 'Steeped cold for 20 hours. Smooth and never bitter.', badge: 'New' },
  { legacyId: 4, name: 'Matcha Latte', price: 15.5, category: 'Tea', imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop&auto=format', rating: 4.6, calories: 200, description: 'Ceremonial-grade matcha whisked with chilled oat milk.', badge: null },
  { legacyId: 5, name: 'Croissant', price: 8.5, category: 'Pastries', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop&auto=format', rating: 4.5, calories: 320, description: 'Buttery laminated dough, baked fresh every morning.', badge: null },
  { legacyId: 6, name: 'Iced Americano', price: 11.9, category: 'Cold Drinks', imageUrl: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=400&fit=crop&auto=format', rating: 4.7, calories: 15, description: 'Double ristretto over hand-cracked ice.', badge: null },
  { legacyId: 7, name: 'Flat White', price: 13.9, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=400&fit=crop&auto=format', rating: 4.8, calories: 150, description: 'Two ristretto shots with velvety micro-foam milk.', badge: null },
  { legacyId: 8, name: 'Strawberry Frappe', price: 17.9, category: 'Ice Blended', imageUrl: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=400&fit=crop&auto=format', rating: 4.6, calories: 380, description: 'Real strawberries blended with cream and whipped topping.', badge: 'Seasonal' },
  { legacyId: 9, name: 'Avocado Toast', price: 19.9, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&h=400&fit=crop&auto=format', rating: 4.5, calories: 290, description: 'Sourdough with smashed Hass avocado and poached egg.', badge: null },
  { legacyId: 10, name: 'Chocolate Tart', price: 12.9, category: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&auto=format', rating: 4.9, calories: 410, description: '72% dark chocolate ganache in a hand-pressed butter crust.', badge: "Chef's Pick" },
];

const PROMOS = [
  { title: 'Buy 1 Free 1', subtitle: 'Every Tuesday on all lattes', code: 'BOGO50', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop&auto=format', discountPercent: null, fixedOff: 5, minSpend: 18, sortOrder: 1 },
  { title: 'Birthday Month', subtitle: 'Free drink on your birthday', code: 'WELCOME10', imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=400&fit=crop&auto=format', discountPercent: 10, fixedOff: null, minSpend: 15, sortOrder: 2 },
  { title: 'Earn 2× Points', subtitle: 'This weekend only', code: 'KEAMAN15', imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=400&fit=crop&auto=format', discountPercent: 15, fixedOff: null, minSpend: 25, sortOrder: 3 },
  { title: 'Free Delivery', subtitle: 'On orders RM 20+', code: 'FREESHIP', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop&auto=format', discountPercent: null, fixedOff: 3, minSpend: 20, sortOrder: 4 },
];

async function ensureDefaultAdmin(): Promise<boolean> {
  const username = (process.env.SEED_ADMIN_USERNAME ?? 'admin').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) return false;

  const { hash, salt } = await hashPassword(password);
  await prisma.admin.create({
    data: {
      username,
      passwordHash: hash,
      passwordSalt: salt,
      displayName: 'Admin',
      email: 'admin@kafe-eman.local',
      role: 'SUPERADMIN',
      active: true,
    },
  });

  console.log(`  ✔ Created superadmin "${username}"`);
  return true;
}

async function seedCatalog(): Promise<boolean> {
  if ((await prisma.branch.count()) > 0) {
    console.log('  • Branches already exist — skipping catalog seed');
    return false;
  }

  await prisma.branch.createMany({
    data: BRANCHES.map((b) => ({ ...b, active: true })),
  });
  console.log(`  ✔ ${BRANCHES.length} branches`);

  // Categories are a table now; derive them from the menu, preserving first-seen order.
  const categoryNames = [...new Set(MENU_ITEMS.map((i) => i.category))];
  await prisma.category.createMany({
    data: categoryNames.map((name, i) => ({ name, sortOrder: i + 1 })),
  });
  const categories = await prisma.category.findMany();
  const categoryId = new Map(categories.map((c) => [c.name, c.id]));
  console.log(`  ✔ ${categoryNames.length} categories`);

  await prisma.menuItem.createMany({
    data: MENU_ITEMS.map((item, i) => ({
      legacyId: item.legacyId,
      name: item.name,
      description: item.description,
      price: money(item.price),
      categoryId: categoryId.get(item.category)!,
      imageUrl: item.imageUrl,
      rating: item.rating,
      calories: item.calories,
      badge: item.badge,
      active: true,
      sortOrder: i + 1,
    })),
  });
  console.log(`  ✔ ${MENU_ITEMS.length} menu items`);

  await prisma.promo.createMany({
    data: PROMOS.map((p) => ({
      title: p.title,
      subtitle: p.subtitle,
      code: p.code,
      imageUrl: p.imageUrl,
      discountPercent: p.discountPercent,
      fixedOff: p.fixedOff !== null ? money(p.fixedOff) : null,
      minSpend: p.minSpend !== null ? money(p.minSpend) : null,
      active: true,
      sortOrder: p.sortOrder,
    })),
  });
  console.log(`  ✔ ${PROMOS.length} promos`);

  await seedDemoOrders();
  return true;
}

/**
 * Three demo orders so the admin dashboard is not empty on a fresh database.
 * They are deliberately unassigned (no userId) — real orders arrive from the
 * app once a customer signs in.
 */
async function seedDemoOrders(): Promise<void> {
  const now = Date.now();
  const branches = await prisma.branch.findMany();
  const branchBySlug = new Map(branches.map((b) => [b.slug, b]));
  const items = await prisma.menuItem.findMany();
  const itemByLegacyId = new Map(items.map((i) => [i.legacyId!, i]));

  const demo = [
    {
      orderNumber: 'KE-20250624-9102',
      slug: 'kuala-lumpur',
      orderType: 'DELIVERY' as const,
      payMethod: 'TNG' as const,
      status: 'ACTIVE' as const,
      trackingStep: 2,
      lines: [{ legacyId: 1, qty: 2, sugar: '50%', ice: 'Full Ice' }],
      subtotal: 29.8,
      deliveryFee: 3,
      total: 32.8,
      pointsEarned: 33,
      orderNote: 'Less ice on both lattes, please leave at guard house.',
      createdAt: new Date(now - 1000 * 60 * 18),
    },
    {
      orderNumber: 'KE-20250626-1188',
      slug: 'penang',
      orderType: 'PICKUP' as const,
      payMethod: 'CARD' as const,
      status: 'ACTIVE' as const,
      trackingStep: 1,
      lines: [{ legacyId: 4, qty: 1, sugar: '50%', ice: 'Less Ice' }],
      subtotal: 15.5,
      deliveryFee: 0,
      total: 15.5,
      pointsEarned: 16,
      orderNote: 'Extra hot matcha, no straw.',
      createdAt: new Date(now - 1000 * 60 * 8),
    },
    {
      orderNumber: 'KE-20250620-4821',
      slug: 'kuala-lumpur',
      orderType: 'DELIVERY' as const,
      payMethod: 'CARD' as const,
      status: 'DELIVERED' as const,
      trackingStep: 3,
      lines: [{ legacyId: 3, qty: 1, sugar: '0%', ice: 'Less Ice' }],
      subtotal: 13.9,
      deliveryFee: 3,
      total: 16.9,
      pointsEarned: 17,
      orderNote: null,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 4),
    },
  ];

  for (const o of demo) {
    const branch = branchBySlug.get(o.slug)!;
    await prisma.order.create({
      data: {
        orderNumber: o.orderNumber,
        branchId: branch.id,
        branchLabel: branch.label,
        orderType: o.orderType,
        payMethod: o.payMethod,
        status: o.status,
        trackingStep: o.trackingStep,
        subtotal: money(o.subtotal),
        discount: money(0),
        deliveryFee: money(o.deliveryFee),
        total: money(o.total),
        pointsEarned: o.pointsEarned,
        pointsRedeemed: 0,
        orderNote: o.orderNote,
        createdAt: o.createdAt,
        items: {
          create: o.lines.map((line) => {
            const item = itemByLegacyId.get(line.legacyId)!;
            return {
              menuItemId: item.id,
              legacyMenuItemId: item.legacyId,
              name: item.name,
              price: item.price,
              qty: line.qty,
              sugar: line.sugar,
              ice: line.ice,
            };
          }),
        },
      },
    });
  }

  console.log(`  ✔ ${demo.length} demo orders`);
}

async function main(): Promise<void> {
  console.log('Seeding Kafe Eman database…');
  await ensureDefaultAdmin();
  await seedCatalog();
  console.log('Done.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
