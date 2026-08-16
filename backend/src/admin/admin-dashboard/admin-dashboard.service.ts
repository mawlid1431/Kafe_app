import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { toNumber } from '../../common/money';
import { ORDER_STATUS_TO_API } from '../../orders/order.mapper';

const OVERVIEW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

function dayStart(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function buildDailyBuckets(start: number, end: number): number[] {
  const keys: number[] = [];
  for (let t = dayStart(start); t <= end; t += DAY_MS) keys.push(t);
  return keys;
}

/**
 * Dashboard KPIs, revenue trend and per-branch breakdown.
 *
 * The aggregates are pushed into Postgres rather than computed in memory. Only
 * the 14-day trend window is materialised, because it needs local-time day
 * bucketing that SQL would express far less clearly.
 */
@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const now = Date.now();
    const start = now - OVERVIEW_DAYS * DAY_MS;
    const startDate = new Date(start);
    const dayKeys = buildDailyBuckets(start, now);

    const [
      totalOrders,
      statusGroups,
      totalRevenueAgg,
      periodRevenueAgg,
      totalCustomers,
      newCustomers,
      menuItems,
      activePromos,
      branchCount,
      branches,
      recentOrders,
      ordersPerBranch,
      revenuePerBranch,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' }, createdAt: { gte: startDate } },
        _sum: { total: true },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.menuItem.count({ where: { active: true } }),
      this.prisma.promo.count({ where: { active: true } }),
      this.prisma.branch.count({ where: { active: true } }),
      this.prisma.branch.findMany({ select: { id: true, slug: true, label: true } }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, total: true, status: true },
      }),
      this.prisma.order.groupBy({ by: ['branchId'], _count: { _all: true } }),
      this.prisma.order.groupBy({
        by: ['branchId'],
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
    ]);

    const statusCount = (status: 'ACTIVE' | 'DELIVERED' | 'CANCELLED') =>
      statusGroups.find((g) => g.status === status)?._count._all ?? 0;

    // ── 14-day trend, bucketed in local time ──────────────────────────
    const trendMap = new Map(dayKeys.map((k) => [k, { orders: 0, revenue: 0 }]));
    for (const order of recentOrders) {
      const bucket = trendMap.get(dayStart(order.createdAt.getTime()));
      if (!bucket) continue;
      bucket.orders += 1;
      if (order.status !== 'CANCELLED') bucket.revenue += toNumber(order.total);
    }
    const ordersTrend = dayKeys.map((timestamp) => {
      const data = trendMap.get(timestamp) ?? { orders: 0, revenue: 0 };
      return { timestamp, orders: data.orders, revenue: data.revenue };
    });

    // ── Per-branch ─────────────────────────────────────────────────────
    const branchById = new Map(branches.map((b) => [b.id, b]));
    const revenueById = new Map(
      revenuePerBranch.map((r) => [r.branchId, toNumber(r._sum.total)]),
    );

    const ordersByBranch = ordersPerBranch
      .map((row) => {
        const branch = row.branchId ? branchById.get(row.branchId) : undefined;
        return {
          slug: branch?.slug ?? 'unknown',
          label: branch?.label ?? 'Removed branch',
          orders: row._count._all,
          revenue: revenueById.get(row.branchId) ?? 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const ordersByStatus = statusGroups.map((g) => ({
      status: ORDER_STATUS_TO_API[g.status],
      count: g._count._all,
    }));

    return {
      computedAt: now,
      periodDays: OVERVIEW_DAYS,
      totalOrders,
      activeOrders: statusCount('ACTIVE'),
      deliveredOrders: statusCount('DELIVERED'),
      totalRevenue: toNumber(totalRevenueAgg._sum.total),
      periodRevenue: toNumber(periodRevenueAgg._sum.total),
      totalCustomers,
      newCustomers,
      menuItems,
      activePromos,
      branches: branchCount,
      ordersTrend,
      ordersByBranch,
      ordersByStatus,
    };
  }
}
