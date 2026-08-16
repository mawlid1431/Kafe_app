/**
 * Customer order pipeline verification.
 *
 *   bun test/orders-verify.ts
 *
 * The HTTP layer for these endpoints is guarded by a Clerk JWT, which cannot be
 * minted outside a signed-in device. This drives the same services the
 * controllers call, against the real Neon database, so the parts that actually
 * carry risk — pricing, the create transaction, points accounting and the
 * cancellation refund — are verified rather than assumed.
 *
 * Creates a throwaway user and removes it, and everything it owns, at the end.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { OrdersService } from '../src/orders/orders.service';
import { DELIVERY_FEE } from '../src/common/order-rules';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = ''): void {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(title: string): void {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 58 - title.length))}`);
}

const TEST_CLERK_ID = 'e2e_test_clerk_user';
const TEST_EMAIL = 'e2e-order-test@kafe-eman.local';

async function main(): Promise<void> {
  console.log('Customer order pipeline verification (service layer → Neon)\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const prisma = app.get(PrismaService);
  const orders = app.get(OrdersService);

  // ── Fixture ────────────────────────────────────────────────────
  await prisma.order.deleteMany({ where: { user: { clerkId: TEST_CLERK_ID } } });
  await prisma.user.deleteMany({ where: { clerkId: TEST_CLERK_ID } });

  const user = await prisma.user.create({
    data: { clerkId: TEST_CLERK_ID, email: TEST_EMAIL, name: 'E2E Order Tester', points: 500 },
  });

  const latte = await prisma.menuItem.findFirst({ where: { legacyId: 1 } });
  if (!latte) throw new Error('Seed data missing — run: bun run seed');
  const price = Number(latte.price);

  try {
    // ══ CREATE ═══════════════════════════════════════════════════
    section('Place a delivery order');
    const result = await orders.create(user.id, {
      branchSlug: 'kuala-lumpur',
      orderType: 'delivery',
      payMethod: 'tng',
      items: [{ menuItemId: 1, name: latte.name, qty: 2, sugar: '50%', ice: 'Full Ice' }],
      orderNote: 'E2E verification order',
    });

    check('order created', Boolean(result.orderId));
    check('order number matches KE-YYYYMMDD-NNNN',
      /^KE-\d{8}-\d{4}$/.test(result.orderNumber), result.orderNumber);

    const expectedSubtotal = Math.round(price * 2 * 100) / 100;
    const expectedTotal = Math.round((expectedSubtotal + DELIVERY_FEE) * 100) / 100;
    check(`server priced it from the database (${expectedTotal})`,
      result.total === expectedTotal, `got ${result.total}`);
    check('points earned = floor(total)', result.pointsEarned === Math.floor(expectedTotal),
      `got ${result.pointsEarned}`);

    const stored = await prisma.order.findUnique({
      where: { orderNumber: result.orderNumber },
      include: { items: true, branch: true },
    });
    check('persisted to Neon', Boolean(stored));
    // Assert the stored column rather than subtracting two floats in the test.
    check('delivery fee applied', Number(stored?.deliveryFee) === DELIVERY_FEE,
      `got ${stored?.deliveryFee}`);
    check('subtotal stored', Number(stored?.subtotal) === expectedSubtotal,
      `got ${stored?.subtotal}`);
    check('line items written to order_items', stored?.items.length === 1);
    check('line snapshots the price at purchase time',
      Number(stored?.items[0]?.price) === price, `got ${stored?.items[0]?.price}`);
    check('line keeps the menu item FK', Boolean(stored?.items[0]?.menuItemId));
    check('branch FK resolved', stored?.branch?.slug === 'kuala-lumpur');
    check('branchLabel snapshotted', stored?.branchLabel === 'Kuala Lumpur');
    check('sugar/ice options stored',
      stored?.items[0]?.sugar === '50%' && stored?.items[0]?.ice === 'Full Ice');
    check('order note stored', stored?.orderNote === 'E2E verification order');

    const afterCreate = await prisma.user.findUnique({ where: { id: user.id } });
    check('points credited to the customer', afterCreate?.points === 500 + result.pointsEarned,
      `500 → ${afterCreate?.points}`);
    check('home branch updated from the order', afterCreate?.branchId === stored?.branchId);

    // ══ READ ═════════════════════════════════════════════════════
    section('Read back');
    const mine = await orders.listMine(user.id);
    check('listMine returns the order', mine.some((o) => o.orderNumber === result.orderNumber));
    check('status is lowercase for the app', mine[0]?.status === 'active');
    check('orderType is lowercase for the app', mine[0]?.orderType === 'delivery');
    check('money serialises as a number', typeof mine[0]?.total === 'number');

    const one = await orders.getMine(user.id, result.orderNumber);
    check('getMine returns the order', one.orderNumber === result.orderNumber);

    let leaked = false;
    try {
      const other = await prisma.user.create({
        data: { clerkId: 'e2e_other_user', email: 'e2e-other@kafe-eman.local', name: 'Other' },
      });
      await orders.getMine(other.id, result.orderNumber);
      leaked = true;
      await prisma.user.delete({ where: { id: other.id } });
    } catch {
      await prisma.user.deleteMany({ where: { clerkId: 'e2e_other_user' } });
    }
    check("another customer cannot read this order", !leaked);

    // ══ PROMO + POINTS ═══════════════════════════════════════════
    section('Promo and points redemption');
    const promoOrder = await orders.create(user.id, {
      branchSlug: 'penang',
      orderType: 'pickup',
      payMethod: 'card',
      items: [{ menuItemId: 1, name: latte.name, qty: 3 }],
      promoCode: 'WELCOME10',
      pointsToRedeem: 200,
    });

    const promoStored = await prisma.order.findUnique({
      where: { orderNumber: promoOrder.orderNumber },
    });
    const sub3 = Math.round(price * 3 * 100) / 100;
    const disc = Math.round(sub3 * 10) / 100; // 10 percent
    const expected = Math.round((sub3 - disc - 2) * 100) / 100; // 200 points = RM 2

    check('no delivery fee on pickup', Number(promoStored?.deliveryFee) === 0);
    check(`promo discount applied (${disc})`, Number(promoStored?.discount) === disc,
      `got ${promoStored?.discount}`);
    check('promo code snapshotted', promoStored?.promoCode === 'WELCOME10');
    check('promo FK linked', Boolean(promoStored?.promoId));
    check('200 points redeemed as RM 2', promoStored?.pointsRedeemed === 200);
    check(`total = ${expected}`, promoOrder.total === expected, `got ${promoOrder.total}`);

    const afterPromo = await prisma.user.findUnique({ where: { id: user.id } });
    const expectedPoints = 500 + result.pointsEarned - 200 + promoOrder.pointsEarned;
    check('points debited then credited correctly', afterPromo?.points === expectedPoints,
      `expected ${expectedPoints}, got ${afterPromo?.points}`);

    // ══ CANCEL + REFUND ══════════════════════════════════════════
    section('Cancellation and points refund');
    const before = afterPromo!.points;
    await orders.cancelMine(user.id, promoOrder.orderNumber);

    const cancelled = await prisma.order.findUnique({
      where: { orderNumber: promoOrder.orderNumber },
    });
    check('order is CANCELLED', cancelled?.status === 'CANCELLED');

    const afterCancel = await prisma.user.findUnique({ where: { id: user.id } });
    const expectedRefund = before + 200 - promoOrder.pointsEarned;
    check('redeemed points returned, earned points removed',
      afterCancel?.points === expectedRefund,
      `expected ${expectedRefund}, got ${afterCancel?.points}`);

    let doubleCancelBlocked = false;
    try {
      await orders.cancelMine(user.id, promoOrder.orderNumber);
    } catch {
      doubleCancelBlocked = true;
    }
    check('cancelling twice is rejected', doubleCancelBlocked);

    // Past the preparing stage, the customer may no longer cancel.
    await prisma.order.update({
      where: { orderNumber: result.orderNumber },
      data: { trackingStep: 2 },
    });
    let lateCancelBlocked = false;
    try {
      await orders.cancelMine(user.id, result.orderNumber);
    } catch {
      lateCancelBlocked = true;
    }
    check('cannot cancel once out for delivery', lateCancelBlocked);

    // ══ GUARDS ═══════════════════════════════════════════════════
    section('Business rules');
    await prisma.user.update({ where: { id: user.id }, data: { suspended: true } });
    let suspendedBlocked = false;
    try {
      await orders.create(user.id, {
        branchSlug: 'penang', orderType: 'pickup', payMethod: 'card',
        items: [{ menuItemId: 1, name: latte.name, qty: 1 }],
      });
    } catch {
      suspendedBlocked = true;
    }
    check('suspended customer cannot order', suspendedBlocked);
    await prisma.user.update({ where: { id: user.id }, data: { suspended: false } });

    let inactiveBranchBlocked = false;
    try {
      await orders.create(user.id, {
        branchSlug: 'does-not-exist', orderType: 'pickup', payMethod: 'card',
        items: [{ menuItemId: 1, name: latte.name, qty: 1 }],
      });
    } catch {
      inactiveBranchBlocked = true;
    }
    check('unknown branch rejected', inactiveBranchBlocked);

    let unknownItemBlocked = false;
    try {
      await orders.create(user.id, {
        branchSlug: 'penang', orderType: 'pickup', payMethod: 'card',
        items: [{ name: 'Not A Real Drink', qty: 1 }],
      });
    } catch {
      unknownItemBlocked = true;
    }
    check('unknown menu item rejected', unknownItemBlocked);

    const balance = (await prisma.user.findUnique({ where: { id: user.id } }))!.points;
    const overRedeem = await orders.create(user.id, {
      branchSlug: 'penang', orderType: 'pickup', payMethod: 'card',
      items: [{ menuItemId: 1, name: latte.name, qty: 1 }],
      pointsToRedeem: balance + 100_000,
    });
    const overStored = await prisma.order.findUnique({
      where: { orderNumber: overRedeem.orderNumber },
    });
    check('over-redemption clamped to the balance',
      (overStored?.pointsRedeemed ?? 0) <= balance,
      `redeemed ${overStored?.pointsRedeemed} of ${balance}`);
    check('total never goes negative', overRedeem.total >= 0, `got ${overRedeem.total}`);

    // ══ ADMIN SEES IT ════════════════════════════════════════════
    section('Application → admin synchronisation');
    const visibleToAdmin = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
    });
    check('customer orders are visible in the admin data set',
      visibleToAdmin.length >= 3, `found ${visibleToAdmin.length}`);
    check('every order carries its line items',
      visibleToAdmin.every((o) => o.items.length > 0));
  } finally {
    // ── Cleanup ──────────────────────────────────────────────────
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { clerkId: TEST_CLERK_ID } });
    await prisma.user.deleteMany({ where: { clerkId: 'e2e_other_user' } });

    const leftover = await prisma.user.count({ where: { clerkId: TEST_CLERK_ID } });
    check('test fixtures removed', leftover === 0);

    await app.close();
  }

  console.log(`\n${'═'.repeat(64)}`);
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('\n  Failures:');
    for (const f of failures) console.log(`    • ${f}`);
  }
  console.log(`${'═'.repeat(64)}\n`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error('\nVerification crashed:', error);
  process.exitCode = 1;
});
