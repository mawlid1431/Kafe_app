import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { toNumber, toOptionalNumber } from '../common/money';
import { calcPromoDiscount, type PromoRules } from '../common/order-rules';

/**
 * Public read models — no authentication required. Admin edits become visible
 * to the app on its next fetch.
 */
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listBranches() {
    const rows = await this.prisma.branch.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((b) => ({
      slug: b.slug,
      label: b.label,
      address: b.address,
      hours: b.hours,
      imageUrl: b.imageUrl ?? undefined,
      lat: b.lat,
      lng: b.lng,
    }));
  }

  async listMenu(category?: string) {
    const filterByCategory = category && category !== 'All';

    const rows = await this.prisma.menuItem.findMany({
      where: {
        active: true,
        ...(filterByCategory ? { category: { name: category } } : {}),
      },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((item) => ({
      legacyId: item.legacyId ?? undefined,
      name: item.name,
      description: item.description,
      price: toNumber(item.price),
      category: item.category.name,
      imageUrl: item.imageUrl,
      rating: item.rating ?? undefined,
      calories: item.calories ?? undefined,
      badge: item.badge ?? undefined,
    }));
  }

  /** Returns `['All', ...sorted]` — same contract the category chips expect. */
  async listCategories(): Promise<string[]> {
    const rows = await this.prisma.category.findMany({
      where: { items: { some: { active: true } } },
      orderBy: { name: 'asc' },
      select: { name: true },
    });
    return ['All', ...rows.map((c) => c.name)];
  }

  async listPromos() {
    const rows = await this.prisma.promo.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((p) => ({
      title: p.title,
      subtitle: p.subtitle,
      code: p.code,
      imageUrl: p.imageUrl ?? undefined,
      discountPercent: p.discountPercent ?? undefined,
      fixedOff: toOptionalNumber(p.fixedOff),
      minSpend: toOptionalNumber(p.minSpend),
    }));
  }

  /** Loads an active promo as plain business-rule input. */
  async findActivePromoRules(code: string | undefined): Promise<PromoRules | null> {
    if (!code?.trim()) return null;

    const promo = await this.prisma.promo.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!promo || !promo.active) return null;

    return {
      code: promo.code,
      discountPercent: promo.discountPercent,
      fixedOff: toOptionalNumber(promo.fixedOff) ?? null,
      minSpend: toOptionalNumber(promo.minSpend) ?? null,
    };
  }

  /** Checkout-time promo check. Mirrors the `promos.validate` union response. */
  async validatePromo(code: string, subtotal: number) {
    const promo = await this.prisma.promo.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo || !promo.active) {
      return { valid: false as const, reason: 'Invalid promo code' };
    }

    const rules: PromoRules = {
      code: promo.code,
      discountPercent: promo.discountPercent,
      fixedOff: toOptionalNumber(promo.fixedOff) ?? null,
      minSpend: toOptionalNumber(promo.minSpend) ?? null,
    };

    const minSpend = toOptionalNumber(promo.minSpend);
    const discount = calcPromoDiscount(subtotal, rules);

    if (discount === 0 && minSpend !== undefined && subtotal < minSpend) {
      return {
        valid: false as const,
        reason: `Min spend RM ${minSpend.toFixed(0)} required`,
      };
    }

    return {
      valid: true as const,
      code: promo.code,
      label: promo.title || promo.code,
      discount,
      discountPercent: promo.discountPercent ?? undefined,
      fixedOff: toOptionalNumber(promo.fixedOff),
      minSpend,
    };
  }
}
