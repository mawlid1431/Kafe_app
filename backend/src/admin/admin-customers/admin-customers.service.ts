import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /** All app customers, newest first. */
  async list() {
    const users = await this.prisma.user.findMany({
      include: { branch: { select: { slug: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      pictureUrl: u.pictureUrl ?? undefined,
      branchSlug: u.branch?.slug ?? undefined,
      points: u.points,
      suspended: u.suspended,
      createdAt: u.createdAt,
    }));
  }

  /** Adjusts a customer's points, suspension state or home branch. */
  async update(id: string, dto: UpdateCustomerDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Customer not found.');
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.points !== undefined) data.points = Math.max(0, dto.points);
    if (dto.suspended !== undefined) data.suspended = dto.suspended;

    if (dto.branchSlug !== undefined) {
      if (!dto.branchSlug) {
        data.branch = { disconnect: true };
      } else {
        const branch = await this.prisma.branch.findUnique({
          where: { slug: dto.branchSlug },
          select: { id: true },
        });
        if (!branch) {
          throw new NotFoundException('Branch not found.');
        }
        data.branch = { connect: { id: branch.id } };
      }
    }

    await this.prisma.user.update({ where: { id }, data });
  }
}
