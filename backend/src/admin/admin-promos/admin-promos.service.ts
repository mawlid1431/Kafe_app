import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { toDecimal } from '../../common/money';
import type { CreatePromoDto, UpdatePromoDto } from './dto/promo.dto';

@Injectable()
export class AdminPromosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /** All promos, including inactive ones. */
  listAll() {
    return this.prisma.promo.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  /** Creates a promo. Codes are always stored uppercase. */
  async create(dto: CreatePromoDto) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.promo.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException('Promo code already exists.');
    }

    const count = await this.prisma.promo.count();

    return this.prisma.promo.create({
      data: {
        title: dto.title.trim(),
        subtitle: dto.subtitle.trim(),
        code,
        imageUrl: dto.imageUrl ?? null,
        imagePublicId: dto.imagePublicId ?? null,
        discountPercent: dto.discountPercent ?? null,
        fixedOff: dto.fixedOff !== undefined ? toDecimal(dto.fixedOff) : null,
        minSpend: dto.minSpend !== undefined ? toDecimal(dto.minSpend) : null,
        active: dto.active,
        sortOrder: count + 1,
      },
    });
  }

  /** Updates a promo, replacing its Cloudinary asset when the image changes. */
  async update(id: string, dto: UpdatePromoDto): Promise<void> {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) {
      throw new NotFoundException('Promo not found.');
    }

    const data: Prisma.PromoUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.subtitle !== undefined) data.subtitle = dto.subtitle.trim();
    if (dto.code !== undefined) data.code = dto.code.trim().toUpperCase();
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl || null;
    if (dto.imagePublicId !== undefined) data.imagePublicId = dto.imagePublicId || null;
    if (dto.discountPercent !== undefined) data.discountPercent = dto.discountPercent;
    if (dto.fixedOff !== undefined) data.fixedOff = toDecimal(dto.fixedOff);
    if (dto.minSpend !== undefined) data.minSpend = toDecimal(dto.minSpend);
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    await this.prisma.promo.update({ where: { id }, data });

    if (dto.imagePublicId !== undefined) {
      await this.cloudinary.destroyReplaced(promo.imagePublicId, dto.imagePublicId || null);
    }
  }

  /**
   * Orders keep their snapshotted `promoCode`; only the live `promoId` link
   * is nulled.
   */
  async remove(id: string): Promise<void> {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) {
      throw new NotFoundException('Promo not found.');
    }

    await this.prisma.promo.delete({ where: { id } });
    await this.cloudinary.destroy(promo.imagePublicId);
  }
}
