import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Branch, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { toNumber, toOptionalNumber } from '../common/money';
import {
  computeOrderTotals,
  type OrderLineInput,
  type PricedLine,
  type PromoRules,
} from '../common/order-rules';

export type PricedLineWithRef = PricedLine & { menuItemRowId: string | null };

/**
 * Server-side pricing.
 *
 * The client never supplies prices or totals — it sends item identities and
 * quantities, and everything monetary is recomputed here from the database.
 */
@Injectable()
export class OrderPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveBranch(branchSlug: string): Promise<Branch> {
    const slug = branchSlug.trim().toLowerCase();
    const branch = await this.prisma.branch.findUnique({ where: { slug } });
    if (!branch || !branch.active) {
      throw new NotFoundException('Branch not found or inactive.');
    }
    return branch;
  }

  async getActivePromo(code: string | undefined) {
    if (!code?.trim()) return null;
    const promo = await this.prisma.promo.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    return promo && promo.active ? promo : null;
  }

  /**
   * Resolves cart lines to live menu rows and stamps the current price onto
   * each. Matching is by `legacyId` first, then case-insensitive name, because
   * older app builds send names without ids.
   */
  async priceLines(lines: OrderLineInput[]): Promise<PricedLineWithRef[]> {
    if (lines.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    const menuItems = await this.prisma.menuItem.findMany({ where: { active: true } });
    const byLegacyId = new Map<number, (typeof menuItems)[number]>();
    const byName = new Map<string, (typeof menuItems)[number]>();
    for (const item of menuItems) {
      if (item.legacyId !== null) byLegacyId.set(item.legacyId, item);
      byName.set(item.name.toLowerCase(), item);
    }

    return lines.map((line) => {
      if (line.qty < 1) {
        throw new BadRequestException('Invalid item quantity.');
      }

      const match =
        (line.menuItemId !== undefined ? byLegacyId.get(line.menuItemId) : undefined) ??
        byName.get(line.name.trim().toLowerCase());

      if (!match) {
        throw new BadRequestException(`Menu item not available: ${line.name}`);
      }

      return {
        menuItemId: match.legacyId ?? line.menuItemId,
        menuItemRowId: match.id,
        name: match.name,
        price: toNumber(match.price),
        qty: line.qty,
        sugar: line.sugar,
        ice: line.ice,
      };
    });
  }

  async buildPricing(args: {
    lines: OrderLineInput[];
    orderType: 'DELIVERY' | 'PICKUP';
    promoCode?: string;
    pointsToRedeem?: number;
    userPointsBalance: number;
  }) {
    const pricedLines = await this.priceLines(args.lines);
    const promoRow = await this.getActivePromo(args.promoCode);

    const promo: PromoRules | null = promoRow
      ? {
          code: promoRow.code,
          discountPercent: promoRow.discountPercent,
          fixedOff: toOptionalNumber(promoRow.fixedOff) ?? null,
          minSpend: toOptionalNumber(promoRow.minSpend) ?? null,
        }
      : null;

    let totals: ReturnType<typeof computeOrderTotals>;
    try {
      totals = computeOrderTotals({
        lines: pricedLines,
        orderType: args.orderType,
        promo,
        pointsToRedeem: args.pointsToRedeem ?? 0,
        userPointsBalance: args.userPointsBalance,
      });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    return { pricedLines, promoRow, totals };
  }

  /**
   * Reverses the points movement of a cancelled order.
   * Runs inside the caller's transaction so the status change and the points
   * refund commit together or not at all.
   */
  static async refundPoints(
    tx: Prisma.TransactionClient,
    order: { userId: string | null; pointsEarned: number; pointsRedeemed: number },
  ): Promise<void> {
    if (!order.userId) return;

    const user = await tx.user.findUnique({ where: { id: order.userId } });
    if (!user) return;

    const next = Math.max(0, user.points + order.pointsRedeemed - order.pointsEarned);
    await tx.user.update({ where: { id: order.userId }, data: { points: next } });
  }
}
