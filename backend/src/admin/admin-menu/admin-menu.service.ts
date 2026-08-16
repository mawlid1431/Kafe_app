import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, MenuItem, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { toDecimal, toNumber } from '../../common/money';
import type { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';

type MenuItemWithCategory = MenuItem & { category: Category };

/** Flattens the Category relation back to a plain string, as the dashboard expects. */
function toApiMenuItem(item: MenuItemWithCategory) {
  return {
    id: item.id,
    legacyId: item.legacyId ?? undefined,
    name: item.name,
    description: item.description,
    price: toNumber(item.price),
    category: item.category.name,
    imageUrl: item.imageUrl,
    imagePublicId: item.imagePublicId ?? undefined,
    rating: item.rating ?? undefined,
    calories: item.calories ?? undefined,
    badge: item.badge ?? undefined,
    active: item.active,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

@Injectable()
export class AdminMenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Categories are a table, but the admin form still takes free text.
   * Creating on demand keeps that UX unchanged for the operator.
   */
  private async resolveCategoryId(name: string): Promise<string> {
    const trimmed = name.trim();
    const existing = await this.prisma.category.findUnique({ where: { name: trimmed } });
    if (existing) return existing.id;

    const count = await this.prisma.category.count();
    const created = await this.prisma.category.create({
      data: { name: trimmed, sortOrder: count + 1 },
    });
    return created.id;
  }

  /** Includes inactive rows, unlike the public catalog. */
  async listAll(category?: string) {
    const filterByCategory = category && category !== 'All';
    const items = await this.prisma.menuItem.findMany({
      where: filterByCategory ? { category: { name: category } } : {},
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });
    return items.map(toApiMenuItem);
  }

  /**
   * Categories that actually contain items, active or hidden.
   *
   * Categories are a table, but they exist to organise items — an empty one is
   * an artefact, not a real filter, and showing it would give the operator a
   * tab that always renders an empty list.
   */
  async categories(): Promise<string[]> {
    const rows = await this.prisma.category.findMany({
      where: { items: { some: {} } },
      orderBy: { name: 'asc' },
      select: { name: true },
    });
    return ['All', ...rows.map((c) => c.name)];
  }

  /**
   * Drops a category once its last item is gone.
   *
   * Without this the table accumulates orphans from typos in the free-text
   * category field. Deliberately best-effort: a category that raced back into
   * use is simply left alone.
   */
  private async pruneCategoryIfEmpty(categoryId: string): Promise<void> {
    const remaining = await this.prisma.menuItem.count({ where: { categoryId } });
    if (remaining > 0) return;
    await this.prisma.category.delete({ where: { id: categoryId } }).catch(() => undefined);
  }

  /** Creates a menu item. */
  async create(dto: CreateMenuItemDto) {
    const categoryId = await this.resolveCategoryId(dto.category);
    const count = await this.prisma.menuItem.count();

    const item = await this.prisma.menuItem.create({
      data: {
        name: dto.name.trim(),
        description: dto.description.trim(),
        price: toDecimal(dto.price),
        categoryId,
        imageUrl: dto.imageUrl.trim(),
        imagePublicId: dto.imagePublicId ?? null,
        rating: dto.rating ?? null,
        calories: dto.calories ?? null,
        badge: dto.badge?.trim() || null,
        active: dto.active,
        sortOrder: count + 1,
      },
      include: { category: true },
    });

    return toApiMenuItem(item);
  }

  /** Updates a menu item, replacing its Cloudinary asset when the image changes. */
  async update(id: string, dto: UpdateMenuItemDto): Promise<void> {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found.');
    }

    const data: Prisma.MenuItemUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.price !== undefined) data.price = toDecimal(dto.price);
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl.trim();
    if (dto.imagePublicId !== undefined) data.imagePublicId = dto.imagePublicId || null;
    if (dto.rating !== undefined) data.rating = dto.rating;
    if (dto.calories !== undefined) data.calories = dto.calories;
    if (dto.badge !== undefined) data.badge = dto.badge?.trim() || null;
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.category !== undefined) {
      data.category = { connect: { id: await this.resolveCategoryId(dto.category) } };
    }

    await this.prisma.menuItem.update({ where: { id }, data });

    // Moving the last item out of a category leaves it orphaned.
    if (dto.category !== undefined) {
      await this.pruneCategoryIfEmpty(item.categoryId);
    }

    if (dto.imagePublicId !== undefined) {
      await this.cloudinary.destroyReplaced(item.imagePublicId, dto.imagePublicId || null);
    }
  }

  /**
   * Deletes a menu item and its Cloudinary asset.
   *
   * OrderItem.menuItemId is `onDelete: SetNull`, so historical orders keep
   * their snapshotted name and price and simply lose the live link.
   */
  async remove(id: string): Promise<void> {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found.');
    }

    await this.prisma.menuItem.delete({ where: { id } });
    await this.pruneCategoryIfEmpty(item.categoryId);
    await this.cloudinary.destroy(item.imagePublicId);
  }
}
