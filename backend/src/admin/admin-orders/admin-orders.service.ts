import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { maxTrackingStep } from '../../common/order-rules';
import { OrderPricingService } from '../../orders/order-pricing.service';
import { toApiOrderWithBranch, toOrderStatus } from '../../orders/order.mapper';
import type { SetTrackingStepDto, UpdateOrderStatusDto } from './dto/admin-order.dto';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** All orders, newest first, optionally filtered by status. */
  async list(status?: string) {
    const where: Prisma.OrderWhereInput = status
      ? { status: toOrderStatus(status) as OrderStatus }
      : {};

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true, branch: { select: { slug: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(toApiOrderWithBranch);
  }

  /**
   * Cancelling refunds the customer's points in the same transaction, and
   * only on the first transition to cancelled — re-cancelling must not refund
   * twice.
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException('Order not found.');
      }

      const nextStatus = toOrderStatus(dto.status);

      await tx.order.update({
        where: { id },
        data: {
          status: nextStatus,
          ...(dto.trackingStep !== undefined ? { trackingStep: dto.trackingStep } : {}),
        },
      });

      if (nextStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        await OrderPricingService.refundPoints(tx, order);
      }
    });
  }

  /** Moves an order one tracking step forward; the last step marks it delivered. */
  async advanceTracking(id: string): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.status !== 'ACTIVE') {
      throw new BadRequestException('Only active orders can be advanced.');
    }

    const maxStep = maxTrackingStep(order.orderType);
    const nextStep = Math.min(order.trackingStep + 1, maxStep);

    await this.prisma.order.update({
      where: { id },
      data: {
        trackingStep: nextStep,
        status: nextStep >= maxStep ? 'DELIVERED' : 'ACTIVE',
      },
    });
  }

  /** Sets an explicit tracking step, clamped to the order type's range. */
  async setTrackingStep(id: string, dto: SetTrackingStepDto): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.status !== 'ACTIVE') {
      throw new BadRequestException('Only active orders can be updated.');
    }

    const maxStep = maxTrackingStep(order.orderType);
    const step = Math.max(0, Math.min(dto.trackingStep, maxStep));

    await this.prisma.order.update({ where: { id }, data: { trackingStep: step } });
  }
}
