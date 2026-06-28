import { query } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

const adminToken = v.string();
const OVERVIEW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

function dayStart(ts: number) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function buildDailyBuckets(start: number, end: number) {
  const keys: number[] = [];
  for (let t = dayStart(start); t <= end; t += DAY_MS) {
    keys.push(t);
  }
  return keys;
}

export const overview = query({
  args: { adminToken },
  returns: v.object({
    computedAt: v.number(),
    periodDays: v.number(),
    totalOrders: v.number(),
    activeOrders: v.number(),
    deliveredOrders: v.number(),
    totalRevenue: v.number(),
    periodRevenue: v.number(),
    totalCustomers: v.number(),
    newCustomers: v.number(),
    menuItems: v.number(),
    activePromos: v.number(),
    branches: v.number(),
    ordersTrend: v.array(
      v.object({
        timestamp: v.number(),
        orders: v.number(),
        revenue: v.number(),
      }),
    ),
    ordersByBranch: v.array(
      v.object({
        slug: v.string(),
        label: v.string(),
        orders: v.number(),
        revenue: v.number(),
      }),
    ),
    ordersByStatus: v.array(
      v.object({
        status: v.string(),
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);

    const now = Date.now();
    const start = now - OVERVIEW_DAYS * DAY_MS;
    const dayKeys = buildDailyBuckets(start, now);

    const orders = await ctx.db.query('orders').collect();
    const users = await ctx.db.query('users').collect();
    const menuItems = await ctx.db.query('menuItems').collect();
    const promos = await ctx.db.query('promos').collect();
    const branches = await ctx.db.query('branches').collect();
    const branchLabels = new Map(branches.map((b) => [b.slug, b.label]));

    const recentOrders = orders.filter((o) => o.createdAt >= start);
    const delivered = orders.filter((o) => o.status === 'delivered');
    const active = orders.filter((o) => o.status === 'active');
    const recentUsers = users.filter((u) => u.createdAt >= start);

    const ordersTrendMap = new Map(dayKeys.map((k) => [k, { orders: 0, revenue: 0 }]));
    for (const order of recentOrders) {
      const key = dayStart(order.createdAt);
      const bucket = ordersTrendMap.get(key);
      if (!bucket) continue;
      bucket.orders += 1;
      if (order.status !== 'cancelled') bucket.revenue += order.total;
    }

    const ordersTrend = dayKeys.map((timestamp) => {
      const data = ordersTrendMap.get(timestamp) ?? { orders: 0, revenue: 0 };
      return { timestamp, orders: data.orders, revenue: data.revenue };
    });

    const branchMap = new Map<string, { orders: number; revenue: number }>();
    for (const order of orders) {
      const slug = order.branchSlug;
      const entry = branchMap.get(slug) ?? { orders: 0, revenue: 0 };
      entry.orders += 1;
      if (order.status !== 'cancelled') entry.revenue += order.total;
      branchMap.set(slug, entry);
    }

    const ordersByBranch = [...branchMap.entries()]
      .map(([slug, data]) => ({
        slug,
        label: branchLabels.get(slug) ?? slug,
        orders: data.orders,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const statusCounts = new Map<string, number>();
    for (const order of orders) {
      statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
    }

    const ordersByStatus = [...statusCounts.entries()].map(([status, count]) => ({
      status,
      count,
    }));

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    const periodRevenue = recentOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      computedAt: now,
      periodDays: OVERVIEW_DAYS,
      totalOrders: orders.length,
      activeOrders: active.length,
      deliveredOrders: delivered.length,
      totalRevenue,
      periodRevenue,
      totalCustomers: users.length,
      newCustomers: recentUsers.length,
      menuItems: menuItems.filter((m) => m.active).length,
      activePromos: promos.filter((p) => p.active).length,
      branches: branches.filter((b) => b.active).length,
      ordersTrend,
      ordersByBranch,
      ordersByStatus,
    };
  },
});
