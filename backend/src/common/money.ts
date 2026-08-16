import { Prisma } from '@prisma/client';

/** Prisma Decimal (or null) → plain JS number, for use inside services. */
export function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : value.toNumber();
}

/** Prisma Decimal (or null) → number | undefined, preserving "not set". */
export function toOptionalNumber(
  value: Prisma.Decimal | number | null | undefined,
): number | undefined {
  if (value === null || value === undefined) return undefined;
  return typeof value === 'number' ? value : value.toNumber();
}

/** JS number → Decimal for writing money columns. */
export function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}
