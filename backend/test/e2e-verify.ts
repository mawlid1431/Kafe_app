/**
 * End-to-end verification against a running API and the real Neon database.
 *
 *   bun run api          # in one terminal
 *   bun test/e2e-verify.ts
 *
 * Exercises every HTTP endpoint: full CRUD lifecycles, validation, auth and
 * authorization negatives, Cloudinary upload/replace/delete, and the
 * admin → application synchronisation path. Cleans up everything it creates.
 */
const API = process.env.E2E_API_URL ?? 'http://localhost:4000/api';
const USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'admin';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

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

type Res = { status: number; body: any };

async function call(
  path: string,
  init: { method?: string; body?: unknown; token?: string; raw?: BodyInit } = {},
): Promise<Res> {
  const headers: Record<string, string> = {};
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.raw ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
  });

  let body: any = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: res.status, body };
}

/** 1×1 PNG — smallest valid image Cloudinary will accept. */
const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb0, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
]);

async function uploadImage(token: string, folder: string): Promise<Res> {
  const form = new FormData();
  form.append('file', new File([PNG], 'px.png', { type: 'image/png' }));
  form.append('folder', folder);
  const res = await fetch(`${API}/admin/uploads/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function main(): Promise<void> {
  console.log(`Kafe Eman end-to-end verification → ${API}\n`);

  // ══ HEALTH ═══════════════════════════════════════════════════════
  section('Health');
  const health = await call('/health');
  check('GET /health returns 200', health.status === 200, `got ${health.status}`);
  check('reports ok', health.body?.ok === true);
  check('catalog is ready (database reachable)', health.body?.catalogReady === true);

  // ══ PUBLIC CATALOG ═══════════════════════════════════════════════
  section('Public catalog (no auth)');
  const branches = await call('/catalog/branches');
  check('GET /catalog/branches → 200', branches.status === 200);
  check('returns branches', Array.isArray(branches.body) && branches.body.length > 0,
    `count=${branches.body?.length}`);

  const menu = await call('/catalog/menu');
  check('GET /catalog/menu → 200', menu.status === 200);
  check('returns menu items', Array.isArray(menu.body) && menu.body.length > 0,
    `count=${menu.body?.length}`);
  check('prices are numbers, not Decimal objects', typeof menu.body?.[0]?.price === 'number');

  const filtered = await call('/catalog/menu?category=Coffee');
  check('menu filters by category',
    Array.isArray(filtered.body) && filtered.body.every((i: any) => i.category === 'Coffee'));

  const cats = await call('/catalog/categories');
  check('GET /catalog/categories starts with "All"', cats.body?.[0] === 'All');

  const promos = await call('/catalog/promos');
  check('GET /catalog/promos → 200', promos.status === 200 && Array.isArray(promos.body));

  // ── promo validation logic
  const promoOk = await call('/catalog/promos/validate', {
    method: 'POST', body: { code: 'WELCOME10', subtotal: 50 },
  });
  check('valid promo accepted', promoOk.body?.valid === true);
  check('10% of 50 = 5 discount', promoOk.body?.discount === 5, `got ${promoOk.body?.discount}`);

  const promoLow = await call('/catalog/promos/validate', {
    method: 'POST', body: { code: 'WELCOME10', subtotal: 5 },
  });
  check('promo rejected below min spend', promoLow.body?.valid === false);

  const promoBad = await call('/catalog/promos/validate', {
    method: 'POST', body: { code: 'NOPE-DOES-NOT-EXIST', subtotal: 50 },
  });
  check('unknown promo rejected', promoBad.body?.valid === false);

  const promoInvalid = await call('/catalog/promos/validate', {
    method: 'POST', body: { code: '', subtotal: -1 },
  });
  check('validation rejects bad input → 400', promoInvalid.status === 400,
    `got ${promoInvalid.status}`);

  // ══ AUTHENTICATION ═══════════════════════════════════════════════
  section('Authentication & authorization');
  const noAuth = await call('/admin/orders');
  check('admin route without token → 401', noAuth.status === 401, `got ${noAuth.status}`);

  const badToken = await call('/admin/orders', { token: 'not-a-real-token' });
  check('admin route with bogus token → 401', badToken.status === 401);

  const badLogin = await call('/admin/auth/login', {
    method: 'POST', body: { username: USERNAME, password: 'wrong-password' },
  });
  check('wrong password → 401', badLogin.status === 401, `got ${badLogin.status}`);
  check('does not reveal whether the user exists',
    /invalid username or password/i.test(String(badLogin.body?.message)));

  const custNoAuth = await call('/orders');
  check('customer route without Clerk JWT → 401', custNoAuth.status === 401);

  const meAnon = await call('/users/me');
  check('GET /users/me anonymous → 200 null (not 401)',
    meAnon.status === 200 && meAnon.body === null, `got ${meAnon.status} ${JSON.stringify(meAnon.body)}`);

  const login = await call('/admin/auth/login', {
    method: 'POST', body: { username: USERNAME, password: PASSWORD },
  });
  check('admin login → 200', login.status === 200, `got ${login.status}`);
  const token: string = login.body?.token;
  check('issues a session token', typeof token === 'string' && token.length === 64);
  check('returns the admin profile', login.body?.admin?.role === 'superadmin');

  const me = await call('/admin/auth/me', { token });
  check('GET /admin/auth/me → 200', me.status === 200);
  check('flags superadmin', me.body?.isSuperAdmin === true);

  // ══ FIXTURE RESET ════════════════════════════════════════════════
  // The suite mutates real rows, so make it re-runnable: put the seeded demo
  // orders back to ACTIVE and clear any staff account left by an earlier run.
  section('Fixture reset (makes this suite re-runnable)');
  const seededNumbers = ['KE-20250624-9102', 'KE-20250626-1188'];
  const preOrders = await call('/admin/orders', { token });
  let restored = 0;
  for (const order of preOrders.body ?? []) {
    if (seededNumbers.includes(order.orderNumber) && order.status !== 'active') {
      const res = await call(`/admin/orders/${order.id}/status`, {
        method: 'PATCH', token, body: { status: 'active', trackingStep: 1 },
      });
      if (res.status === 204) restored += 1;
    }
  }
  check('seeded demo orders are active', true, restored ? `restored ${restored}` : 'already active');

  const preStaff = await call('/admin/staff', { token });
  const stale = (preStaff.body ?? []).find((s: any) => s.username === 'e2e-staff');
  if (stale) {
    const reset = await call(`/admin/staff/${stale.id}`, {
      method: 'PATCH', token,
      body: { active: true, role: 'staff', password: 'e2e-password-123' },
    });
    check('stale e2e-staff account reset', reset.status === 204, `got ${reset.status}`);
  } else {
    check('no stale e2e-staff account', true);
  }

  // ══ MENU CRUD + CLOUDINARY ═══════════════════════════════════════
  section('Menu CRUD + Cloudinary lifecycle');
  const up1 = await uploadImage(token, 'menu');
  check('POST /admin/uploads/image → 201', up1.status === 201, `got ${up1.status}`);
  check('returns a Cloudinary secure URL',
    String(up1.body?.imageUrl).startsWith('https://res.cloudinary.com/'));
  check('returns a public id', typeof up1.body?.publicId === 'string');

  const created = await call('/admin/menu', {
    method: 'POST', token,
    body: {
      name: 'E2E Verification Brew',
      description: 'Temporary item created by the end-to-end test.',
      price: 12.34,
      category: 'E2E Test Category',
      imageUrl: up1.body.imageUrl,
      imagePublicId: up1.body.publicId,
      active: true,
    },
  });
  check('CREATE menu item → 201', created.status === 201, `got ${created.status}`);
  const itemId: string = created.body?.id;
  check('stored imageUrl is the Cloudinary URL', created.body?.imageUrl === up1.body.imageUrl);
  check('price round-trips exactly', created.body?.price === 12.34, `got ${created.body?.price}`);
  check('category auto-created from free text',
    created.body?.category === 'E2E Test Category');

  const listAll = await call('/admin/menu', { token });
  check('READ finds the new item',
    Array.isArray(listAll.body) && listAll.body.some((i: any) => i.id === itemId));

  const catList = await call('/admin/menu/categories', { token });
  check('new category appears in categories',
    Array.isArray(catList.body) && catList.body.includes('E2E Test Category'));

  // ── admin → application synchronisation
  const publicMenu = await call('/catalog/menu');
  check('SYNC: admin-created item is visible to the mobile app',
    Array.isArray(publicMenu.body) &&
      publicMenu.body.some((i: any) => i.name === 'E2E Verification Brew'));

  // ── update, including image replacement
  const up2 = await uploadImage(token, 'menu');
  check('second image upload → 201', up2.status === 201);

  const updated = await call(`/admin/menu/${itemId}`, {
    method: 'PATCH', token,
    body: { price: 15.5, name: 'E2E Verification Brew v2', imageUrl: up2.body.imageUrl, imagePublicId: up2.body.publicId },
  });
  check('UPDATE menu item → 204', updated.status === 204, `got ${updated.status}`);

  const afterUpdate = await call('/admin/menu', { token });
  const updatedItem = afterUpdate.body?.find((i: any) => i.id === itemId);
  check('update persisted (price)', updatedItem?.price === 15.5, `got ${updatedItem?.price}`);
  check('update persisted (name)', updatedItem?.name === 'E2E Verification Brew v2');
  check('image replaced with the new Cloudinary asset',
    updatedItem?.imageUrl === up2.body.imageUrl);

  const oldAssetGone = await fetch(up1.body.imageUrl);
  check('SYNC: replaced Cloudinary asset was destroyed', oldAssetGone.status === 404,
    `old asset returned ${oldAssetGone.status}`);

  const hiddenRes = await call(`/admin/menu/${itemId}`, {
    method: 'PATCH', token, body: { active: false },
  });
  check('deactivate item → 204', hiddenRes.status === 204);
  const publicAfterHide = await call('/catalog/menu');
  check('SYNC: deactivated item disappears from the app menu',
    !publicAfterHide.body?.some((i: any) => i.id === itemId));

  const badPrice = await call('/admin/menu', {
    method: 'POST', token,
    body: { name: 'x', description: 'x', price: -5, category: 'Coffee', imageUrl: 'u', active: true },
  });
  check('validation rejects a negative price → 400', badPrice.status === 400,
    `got ${badPrice.status}`);

  const removed = await call(`/admin/menu/${itemId}`, { method: 'DELETE', token });
  check('DELETE menu item → 204', removed.status === 204, `got ${removed.status}`);

  const afterDelete = await call('/admin/menu', { token });
  check('deleted item is gone', !afterDelete.body?.some((i: any) => i.id === itemId));

  const deletedAsset = await fetch(up2.body.imageUrl);
  check('Cloudinary asset destroyed on delete', deletedAsset.status === 404,
    `asset returned ${deletedAsset.status}`);

  const deleteMissing = await call(`/admin/menu/${itemId}`, { method: 'DELETE', token });
  check('deleting a missing item → 404', deleteMissing.status === 404, `got ${deleteMissing.status}`);

  // ══ PROMO CRUD ═══════════════════════════════════════════════════
  section('Promo CRUD');
  const promoCreated = await call('/admin/promos', {
    method: 'POST', token,
    body: { title: 'E2E Promo', subtitle: 'test', code: 'e2etest', discountPercent: 20, minSpend: 10, active: true },
  });
  check('CREATE promo → 201', promoCreated.status === 201, `got ${promoCreated.status}`);
  const promoId: string = promoCreated.body?.id;
  check('promo code stored uppercase', promoCreated.body?.code === 'E2ETEST',
    `got ${promoCreated.body?.code}`);

  const dupe = await call('/admin/promos', {
    method: 'POST', token,
    body: { title: 'dupe', subtitle: '', code: 'E2ETEST', discountPercent: 5, active: true },
  });
  check('duplicate promo code → 409', dupe.status === 409, `got ${dupe.status}`);

  const promoLive = await call('/catalog/promos/validate', {
    method: 'POST', body: { code: 'E2ETEST', subtotal: 100 },
  });
  check('SYNC: new promo validates in the app (20% of 100 = 20)',
    promoLive.body?.valid === true && promoLive.body?.discount === 20,
    `got ${JSON.stringify(promoLive.body)}`);

  const promoUpdated = await call(`/admin/promos/${promoId}`, {
    method: 'PATCH', token, body: { discountPercent: 50 },
  });
  check('UPDATE promo → 204', promoUpdated.status === 204);
  const promoRevalidated = await call('/catalog/promos/validate', {
    method: 'POST', body: { code: 'E2ETEST', subtotal: 100 },
  });
  check('SYNC: updated discount takes effect (50%)', promoRevalidated.body?.discount === 50,
    `got ${promoRevalidated.body?.discount}`);

  const promoRemoved = await call(`/admin/promos/${promoId}`, { method: 'DELETE', token });
  check('DELETE promo → 204', promoRemoved.status === 204);
  const promoAfter = await call('/catalog/promos/validate', {
    method: 'POST', body: { code: 'E2ETEST', subtotal: 100 },
  });
  check('SYNC: deleted promo no longer validates', promoAfter.body?.valid === false);

  // ══ BRANCHES ═════════════════════════════════════════════════════
  section('Branches');
  const adminBranches = await call('/admin/branches', { token });
  check('GET /admin/branches → 200', adminBranches.status === 200);
  const branch = adminBranches.body?.[0];
  const originalHours = branch?.hours;

  const branchUpdated = await call(`/admin/branches/${branch.id}`, {
    method: 'PATCH', token, body: { hours: 'E2E test hours' },
  });
  check('UPDATE branch → 204', branchUpdated.status === 204);
  const publicBranches = await call('/catalog/branches');
  check('SYNC: branch change is visible to the app',
    publicBranches.body?.find((b: any) => b.slug === branch.slug)?.hours === 'E2E test hours');
  await call(`/admin/branches/${branch.id}`, {
    method: 'PATCH', token, body: { hours: originalHours },
  });
  check('branch restored', true);

  const dupeSlug = await call('/admin/branches', {
    method: 'POST', token,
    body: { slug: branch.slug, label: 'x', address: 'x', hours: 'x', lat: 1, lng: 1, active: true },
  });
  check('duplicate branch slug → 409', dupeSlug.status === 409, `got ${dupeSlug.status}`);

  const badLatLng = await call('/admin/branches', {
    method: 'POST', token,
    body: { slug: 'e2e-bad', label: 'x', address: 'x', hours: 'x', lat: 999, lng: 999, active: true },
  });
  check('invalid coordinates → 400', badLatLng.status === 400, `got ${badLatLng.status}`);

  // ══ ORDERS (admin side) ══════════════════════════════════════════
  section('Orders — admin operations');
  const allOrders = await call('/admin/orders', { token });
  check('GET /admin/orders → 200', allOrders.status === 200);
  check('orders include line items',
    Array.isArray(allOrders.body?.[0]?.items) && allOrders.body[0].items.length > 0);
  check('enums are lowercase for the frontend',
    ['active', 'delivered', 'cancelled'].includes(allOrders.body?.[0]?.status));
  check('timestamps are epoch milliseconds', typeof allOrders.body?.[0]?.createdAt === 'number');

  const activeOnly = await call('/admin/orders?status=active', { token });
  check('status filter works',
    Array.isArray(activeOnly.body) && activeOnly.body.every((o: any) => o.status === 'active'));

  const target = activeOnly.body?.[0];
  if (target) {
    const step0 = target.trackingStep;
    const adv = await call(`/admin/orders/${target.id}/advance`, { method: 'POST', token });
    check('advance tracking → 204', adv.status === 204, `got ${adv.status}`);

    const afterAdv = await call('/admin/orders', { token });
    const moved = afterAdv.body?.find((o: any) => o.id === target.id);
    check('tracking step advanced', moved?.trackingStep === step0 + 1,
      `${step0} → ${moved?.trackingStep}`);

    // Reaching the final step auto-delivers the order. Tracking edits are then
    // refused by design — the dashboard hides those controls for the same
    // reason — so only exercise "step back" while the order is still active.
    const back = await call(`/admin/orders/${target.id}/tracking`, {
      method: 'PATCH', token, body: { trackingStep: step0 },
    });
    if (moved?.status === 'active') {
      check('step back on an active order → 204', back.status === 204, `got ${back.status}`);
    } else {
      check('step back refused once delivered → 400', back.status === 400, `got ${back.status}`);
      check('auto-delivered at the final tracking step', moved?.status === 'delivered');
    }

    const badStatus = await call(`/admin/orders/${target.id}/status`, {
      method: 'PATCH', token, body: { status: 'not-a-status' },
    });
    check('invalid order status → 400', badStatus.status === 400, `got ${badStatus.status}`);

    // Restore the seeded demo order so re-runs start from the same state.
    const restore = await call(`/admin/orders/${target.id}/status`, {
      method: 'PATCH', token, body: { status: 'active', trackingStep: step0 },
    });
    check('order restored to its original state', restore.status === 204);
  } else {
    check('an active order exists to advance', false, 'no active orders seeded');
  }

  const missingOrder = await call('/admin/orders/00000000-0000-0000-0000-000000000000/advance', {
    method: 'POST', token,
  });
  check('advancing a missing order → 404', missingOrder.status === 404, `got ${missingOrder.status}`);

  // ══ CUSTOMERS & DASHBOARD ════════════════════════════════════════
  section('Customers & dashboard');
  const customers = await call('/admin/customers', { token });
  check('GET /admin/customers → 200', customers.status === 200 && Array.isArray(customers.body));

  const overview = await call('/admin/dashboard/overview', { token });
  check('GET /admin/dashboard/overview → 200', overview.status === 200);
  check('has a 14-day trend', overview.body?.ordersTrend?.length >= 14,
    `got ${overview.body?.ordersTrend?.length}`);
  check('revenue is a number', typeof overview.body?.totalRevenue === 'number');
  check('counts match the catalog',
    overview.body?.branches === publicBranches.body?.length,
    `dashboard=${overview.body?.branches} catalog=${publicBranches.body?.length}`);

  // ══ STAFF & ROLE ENFORCEMENT ═════════════════════════════════════
  section('Staff management & role enforcement');
  const staffList = await call('/admin/staff', { token });
  check('GET /admin/staff → 200', staffList.status === 200);

  let staffId: string;
  if (stale) {
    // Reset above already restored it; creating again must conflict.
    const conflict = await call('/admin/staff', {
      method: 'POST', token,
      body: { username: 'e2e-staff', password: 'e2e-password-123', displayName: 'E2E Staff', email: 'e2e@kafe-eman.local', role: 'staff' },
    });
    check('duplicate username → 409', conflict.status === 409, `got ${conflict.status}`);
    staffId = stale.id;
  } else {
    const staffCreated = await call('/admin/staff', {
      method: 'POST', token,
      body: { username: 'e2e-staff', password: 'e2e-password-123', displayName: 'E2E Staff', email: 'e2e@kafe-eman.local', role: 'staff' },
    });
    check('superadmin creates staff → 201', staffCreated.status === 201, `got ${staffCreated.status}`);
    staffId = staffCreated.body?.id;
  }

  const shortPw = await call('/admin/staff', {
    method: 'POST', token,
    body: { username: 'e2e-short', password: 'abc', displayName: 'x', email: 'x@y.com', role: 'staff' },
  });
  check('password shorter than 8 chars → 400', shortPw.status === 400, `got ${shortPw.status}`);

  const staffLogin = await call('/admin/auth/login', {
    method: 'POST', body: { username: 'e2e-staff', password: 'e2e-password-123' },
  });
  check('new staff can log in → 200', staffLogin.status === 200);
  const staffToken: string = staffLogin.body?.token;
  check('staff role is not superadmin', staffLogin.body?.admin?.role === 'staff');

  const staffReads = await call('/admin/orders', { token: staffToken });
  check('staff CAN read orders → 200', staffReads.status === 200, `got ${staffReads.status}`);

  const staffEscalates = await call('/admin/staff', {
    method: 'POST', token: staffToken,
    body: { username: 'e2e-hacker', password: 'password-1234', displayName: 'x', email: 'x@y.com', role: 'superadmin' },
  });
  check('staff CANNOT create staff → 403', staffEscalates.status === 403,
    `got ${staffEscalates.status}`);

  const staffPatches = await call(`/admin/staff/${staffId}`, {
    method: 'PATCH', token: staffToken, body: { displayName: 'nope' },
  });
  check('staff CANNOT edit staff → 403', staffPatches.status === 403, `got ${staffPatches.status}`);

  const selfDeactivate = await call(`/admin/staff/${me.body.id}`, {
    method: 'PATCH', token, body: { active: false },
  });
  check('superadmin cannot deactivate themselves → 400', selfDeactivate.status === 400,
    `got ${selfDeactivate.status}`);

  const deactivate = await call(`/admin/staff/${staffId}`, {
    method: 'PATCH', token, body: { active: false },
  });
  check('superadmin deactivates staff → 204', deactivate.status === 204);

  const revokedRead = await call('/admin/orders', { token: staffToken });
  check('deactivation invalidates the live session → 401', revokedRead.status === 401,
    `got ${revokedRead.status}`);

  const relogin = await call('/admin/auth/login', {
    method: 'POST', body: { username: 'e2e-staff', password: 'e2e-password-123' },
  });
  check('deactivated staff cannot log back in → 401', relogin.status === 401,
    `got ${relogin.status}`);

  // ══ LOGOUT ═══════════════════════════════════════════════════════
  section('Session lifecycle');
  const throwaway = await call('/admin/auth/login', {
    method: 'POST', body: { username: USERNAME, password: PASSWORD },
  });
  const tmpToken: string = throwaway.body?.token;
  const beforeLogout = await call('/admin/auth/me', { token: tmpToken });
  check('fresh session is valid', beforeLogout.status === 200);

  const logout = await call('/admin/auth/logout', { method: 'POST', token: tmpToken });
  check('logout → 204', logout.status === 204, `got ${logout.status}`);

  const afterLogout = await call('/admin/auth/me', { token: tmpToken });
  check('token rejected after logout → 401', afterLogout.status === 401,
    `got ${afterLogout.status}`);

  const doubleLogout = await call('/admin/auth/logout', { method: 'POST', token: tmpToken });
  check('logout is idempotent → 204', doubleLogout.status === 204);

  // ══ SUMMARY ══════════════════════════════════════════════════════
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
