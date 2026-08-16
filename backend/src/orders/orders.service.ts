import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { toDecimal } from '../common/money';
import { applyPointsDelta, canCustomerCancel, generateOrderNumber } from '../common/order-rules';
import { OrderPricingService } from './order-pricing.service';
import { toApiOrder, toOrderType, toPayMethod } from './order.mapper';
import type { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: OrderPricingService,
  ) {}

  /** The signed-in customer's orders, newest first. */
  async listMine(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toApiOrder);
  }

  /** A single order. Another customer's order must read as absent. */
  async getMine(userId: string, orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found.');
    }
    return toApiOrder(order);
  }

  /**
   * Places an order.
   *
   * Everything runs in one interactive transaction — the order, its line items
   * and the customer's points balance commit together or not at all.
   */
  async create(userId: string, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.suspended) {
      throw new ForbiddenException('Your account is suspended. Contact support.');
    }

    const branch = await this.pricing.getActiveBranch(dto.branchSlug);
    const orderType = toOrderType(dto.orderType);

    const { pricedLines, promoRow, totals } = await this.pricing.buildPricing({
      lines: dto.items,
      orderType,
      promoCode: dto.promoCode,
      pointsToRedeem: dto.pointsToRedeem,
      userPointsBalance: user.points,
    });

    const orderNumber = await this.reserveOrderNumber();

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          branchId: branch.id,
          branchLabel: branch.label,
          orderType,
          payMethod: toPayMethod(dto.payMethod),
          status: 'ACTIVE',
          trackingStep: 0,
          subtotal: toDecimal(totals.subtotal),
          discount: toDecimal(totals.discount),
          deliveryFee: toDecimal(totals.deliveryFee),
          total: toDecimal(totals.total),
          promoId: promoRow?.id,
          promoCode: promoRow?.code,
          pointsEarned: totals.pointsEarned,
          pointsRedeemed: totals.pointsRedeemed,
          orderNote: dto.orderNote?.trim() || null,
          items: {
            create: pricedLines.map((line) => ({
              menuItemId: line.menuItemRowId,
              legacyMenuItemId: line.menuItemId ?? null,
              name: line.name,
              price: toDecimal(line.price),
              qty: line.qty,
              sugar: line.sugar ?? null,
              ice: line.ice ?? null,
            })),
          },
        },
        include: { items: true },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          points: applyPointsDelta(user.points, {
            earned: totals.pointsEarned,
            redeemed: totals.pointsRedeemed,
          }),
          branchId: branch.id,
        },
      });

      return order;
    });

    return {
      orderId: created.id,
      orderNumber: created.orderNumber,
      total: totals.total,
      pointsEarned: totals.pointsEarned,
    };
  }

  /** Customer cancellation — only while the kitchen is still preparing. */
  async cancelMine(userId: string, orderNumber: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { orderNumber } });

      if (!order || order.userId !== userId) {
        throw new NotFoundException('Order not found.');
      }
      if (!canCustomerCancel(order.status, order.trackingStep)) {
        throw new BadRequestException('This order can no longer be cancelled.');
      }

      await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      await OrderPricingService.refundPoints(tx, order);
    });
  }

  /**
   * Order numbers embed 4 random digits, so a same-day collision is possible.
   * Retry a few times rather than failing a paid checkout.
   */
  private async reserveOrderNumber(attempts = 5): Promise<string> {
    for (let i = 0; i < attempts; i += 1) {
      const candidate = generateOrderNumber();
      const clash = await this.prisma.order.findUnique({
        where: { orderNumber: candidate },
        select: { id: true },
      });
      if (!clash) return candidate;
    }
    throw new ConflictException('Could not allocate an order number. Please try again.');
  }
}
