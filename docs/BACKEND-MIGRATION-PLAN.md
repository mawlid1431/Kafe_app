# Backend Migration Plan — Convex → NestJS + Neon + Prisma + Bun + Cloudinary

Status: **analysis complete, nothing changed yet.**
Scope of inspection: `mobile/` (Expo React Native app), `mobile/Admin/` (React + Vite dashboard), `mobile/convex/` (current backend).

---

## 1. What the application actually is

**Kafe Eman** — a coffee-shop ordering platform with three surfaces:

| Surface | Tech | Location |
|---|---|---|
| Customer mobile app | Expo 54 / React Native 0.81 / expo-router | `app/`, `src/features/kafeeman/` |
| Admin dashboard | React 19 + Vite + Tailwind 4 + react-router 7 | `Admin/src/admin/` |
| Public landing site | React (same Vite app, route `/`) | `Admin/src/landing/` |
| Backend | Convex | `convex/` |

Sibling folders `../Kafe_eman`, `../kafe-eman-expo-temp`, `../landing` are older/scratch copies. **`mobile/` is the live git repo** and the only one being migrated.

### Customer user flow (mobile)

`splash → onboarding → auth (Clerk / Apple Sign-In / signup+OTP) → profile-setup → branch picker → home → menu → product-detail (sugar/ice options) → cart → order-type (delivery|pickup) → checkout (address, promo code, redeem points, note) → payment (TnG PIN | card | banking) → order-success → order-tracking (live steps + map) → order-receipt`

Side screens: favorites, orders list/history, rewards, addresses, notifications, help, legal documents, rider chat sheet.

### Admin user flow

`/login (username+password) → /admin (dashboard KPIs & charts) → branches | menu | orders (processing / track / history) | promos | rewards* | customers | notifications* | staff | account`

`*` Rewards and Notifications pages are **static UI only** — no backend calls today. Nothing to migrate for them.

### What is backend state vs. local-only state

This matters a lot for scoping. The mobile app persists a large amount of state **locally in AsyncStorage** (`src/features/kafeeman/lib/storage.ts`, key `@kafeeman/app-state-v1`) and it never touches Convex:

- favorites, saved addresses, in-app notifications, points history log, cart, selected branch, onboarding flag, local profile

**These stay local. The migration does not add endpoints for them.** Only the following is server state today: users, admins, admin sessions, branches, menu items, orders, promos.

The app is also built to run **fully offline** against local seed data (`src/features/kafeeman/data.ts`) whenever the backend is unreachable — see `ConvexSafeProvider` + `useConvexBackendReady`. This offline-fallback behaviour must be preserved after the migration.

---

## 2. Complete Convex inventory

```
convex/
├── schema.ts              7 tables
├── health.ts              1 query
├── catalog.ts             4 queries   (public)
├── promos.ts              1 query     (public)
├── users.ts               2 queries + 1 mutation   (Clerk auth)
├── orders.ts              2 queries + 2 mutations  (Clerk auth)
├── admins.ts              3 queries + 4 mutations  (admin token)
├── branches.ts            1 query  + 2 mutations   (admin token)
├── menuAdmin.ts           2 queries + 3 mutations  (admin token)
├── promosAdmin.ts         1 query  + 3 mutations   (admin token)
├── ordersAdmin.ts         1 query  + 3 mutations   (admin token)
├── customersAdmin.ts      1 query  + 1 mutation    (admin token)
├── adminDashboard.ts      1 query                  (admin token)
├── seed.ts                seed mutations
├── auth.config.ts         Clerk JWT issuer config
└── lib/
    ├── auth.ts            getCurrentUser / getCurrentUserOrNull (Clerk identity → users row)
    ├── adminAuth.ts       requireAdmin / requireSuperAdmin, 7-day session TTL
    ├── password.ts        PBKDF2-SHA256 120k iters, hex salt+hash; SHA-256 token hashing
    ├── orderRules.ts      pure business rules (pricing, points, cancellation, order numbers)
    └── orderPricing.ts    DB-backed pricing helpers
```

**34 functions total. Zero Convex `action`s. Zero scheduled/cron jobs. Zero Convex file storage** — images are plain external URLs typed into admin forms today.

### Business rules extracted (`lib/orderRules.ts` — port verbatim)

| Rule | Value / logic |
|---|---|
| Delivery fee | `RM 3` for delivery, `0` for pickup |
| Points earned | `max(1, floor(total))` — 1 point per RM spent |
| Points → RM | `floor(points / 100)` — 100 points = RM 1 |
| Max redeemable | `min(balance, floor(totalBeforePoints) * 100)` |
| Promo discount | percent: `round(subtotal * pct)/100`; fixed: `min(fixedOff, subtotal)`; `0` if `subtotal < minSpend` |
| Order number | `KE-YYYYMMDD-RRRR` (4 random digits) |
| Customer may cancel | only when `status === 'active' && trackingStep < 2` |
| Max tracking step | delivery `3`, pickup `2`; reaching max ⇒ `delivered` |
| Cancel refund | add back `pointsRedeemed`, subtract `pointsEarned`, clamp at 0 |
| Money rounding | `round(n * 100) / 100` |
| Server authority | **totals are always recomputed server-side; client totals are never trusted** |

### Authorization model

Two completely separate auth systems — this is important and must be preserved:

1. **Customers (mobile)** — Clerk. `ClerkProvider` (`@clerk/expo`) issues a JWT via `getToken({ template: 'convex' })`; Convex validates it against `CLERK_JWT_ISSUER_DOMAIN`. `lib/auth.ts` maps `identity.tokenIdentifier` → `users` row. Suspended users are blocked from ordering.
2. **Admins (dashboard)** — homegrown. `username + password` → PBKDF2 verify → opaque 32-byte random token, SHA-256 hashed into `adminSessions`, 7-day TTL, stored in browser `localStorage` and passed as an explicit `adminToken` argument on every call. Roles: `superadmin` (can manage staff) and `staff`. A superadmin cannot deactivate their own account.

Customers and admins share **no** identity surface.

---

## 3. Data model: Convex today → PostgreSQL/Prisma target

### Current Convex tables

| Table | Fields | Indexes |
|---|---|---|
| `users` | tokenIdentifier, name, email, pictureUrl?, branchSlug?, points?, suspended?, createdAt, updatedAt? | by_token, by_email, by_created |
| `admins` | username, passwordHash, passwordSalt, displayName, email, role, active, timestamps | by_username |
| `adminSessions` | adminId→admins, tokenHash, expiresAt, createdAt | by_token_hash |
| `branches` | slug, label, address, hours, imageUrl?, lat, lng, active, sortOrder, timestamps | by_slug, by_sort |
| `menuItems` | legacyId?, name, description, price, category (string), imageUrl, rating?, calories?, badge?, active, sortOrder, timestamps | by_category_sort, by_sort |
| `orders` | orderNumber, userId?→users, branchSlug, branchLabel, orderType, payMethod, status, trackingStep, **items[] (embedded)**, subtotal, discount, deliveryFee, total, promoCode?, pointsEarned?, pointsRedeemed?, orderNote?, timestamps | by_order_number, by_status_created, by_branch_created, by_created, by_user_created |
| `promos` | title, subtitle, code, imageUrl?, discountPercent?, fixedOff?, minSpend?, active, sortOrder, timestamps | by_code, by_sort |

### Relational redesign (not a blind copy)

Four deliberate structural changes:

1. **`orders.items[]` embedded array → `OrderItem` table** (one-to-many). Convex documents can nest arrays; Postgres shouldn't. Enables per-item reporting ("best-selling drink") which the current schema can't answer.
2. **`menuItems.category` free string → `Category` table** (one-to-many). Today categories are `SELECT DISTINCT category` scans. The service will auto-create a category by name on demand, so the admin form's free-text UX is unchanged.
3. **`branchSlug` string references → real `branchId` foreign keys** on `User` and `Order`. `Order.branchLabel` is *kept* as a snapshot on purpose (see below).
4. **Optional numbers → `NOT NULL DEFAULT`**. Convex `points?`/`suspended?` are defaulted at read time in three separate places; Postgres does this once, correctly.

**Intentional denormalisation (snapshots).** `Order.branchLabel`, `OrderItem.name`, `OrderItem.price`, `Order.promoCode` are copied onto the order at creation time. A historical receipt must not change when an admin renames a branch, edits a price, or deletes a promo. FKs are kept alongside them for analytics, with `onDelete: SetNull`.

### Target Prisma schema (shape)

```prisma
enum AdminRole   { SUPERADMIN STAFF }
enum OrderType   { DELIVERY PICKUP }
enum PayMethod   { TNG CARD BANKING }
enum OrderStatus { ACTIVE DELIVERED CANCELLED }

model User {
  id         String   @id @default(uuid())
  clerkId    String   @unique          // was tokenIdentifier
  email      String   @unique
  name       String
  pictureUrl String?
  points     Int      @default(0)
  suspended  Boolean  @default(false)
  branchId   String?
  branch     Branch?  @relation(fields: [branchId], references: [id], onDelete: SetNull)
  orders     Order[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([createdAt])
}

model Admin {
  id           String         @id @default(uuid())
  username     String         @unique
  passwordHash String
  passwordSalt String
  displayName  String
  email        String
  role         AdminRole      @default(STAFF)
  active       Boolean        @default(true)
  sessions     AdminSession[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model AdminSession {
  id        String   @id @default(uuid())
  adminId   String
  admin     Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)
  tokenHash String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([expiresAt])
}

model Branch {
  id                String   @id @default(uuid())
  slug              String   @unique
  label             String
  address           String
  hours             String
  imageUrl          String?
  imagePublicId     String?          // Cloudinary
  lat               Float
  lng               Float
  active            Boolean  @default(true)
  sortOrder         Int      @default(0)
  users             User[]
  orders            Order[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  @@index([sortOrder])
}

model Category {
  id        String     @id @default(uuid())
  name      String     @unique
  sortOrder Int        @default(0)
  items     MenuItem[]
}

model MenuItem {
  id            String      @id @default(uuid())
  legacyId      Int?        @unique   // numeric id the mobile app matches cart lines/favorites on — KEEP
  name          String
  description   String      @default("")
  price         Decimal     @db.Decimal(10, 2)
  categoryId    String
  category      Category    @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  imageUrl      String
  imagePublicId String?                // Cloudinary
  rating        Float?
  calories      Int?
  badge         String?
  active        Boolean     @default(true)
  sortOrder     Int         @default(0)
  orderItems    OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  @@index([categoryId, sortOrder])
  @@index([sortOrder])
}

model Promo {
  id              String   @id @default(uuid())
  code            String   @unique          // stored uppercase
  title           String
  subtitle        String   @default("")
  imageUrl        String?
  imagePublicId   String?                   // Cloudinary
  discountPercent Int?
  fixedOff        Decimal? @db.Decimal(10, 2)
  minSpend        Decimal? @db.Decimal(10, 2)
  active          Boolean  @default(true)
  sortOrder       Int      @default(0)
  orders          Order[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([sortOrder])
}

model Order {
  id             String      @id @default(uuid())
  orderNumber    String      @unique
  userId         String?
  user           User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  branchId       String?
  branch         Branch?     @relation(fields: [branchId], references: [id], onDelete: SetNull)
  branchLabel    String                      // snapshot
  orderType      OrderType
  payMethod      PayMethod
  status         OrderStatus @default(ACTIVE)
  trackingStep   Int         @default(0)
  items          OrderItem[]
  subtotal       Decimal     @db.Decimal(10, 2)
  discount       Decimal     @db.Decimal(10, 2) @default(0)
  deliveryFee    Decimal     @db.Decimal(10, 2) @default(0)
  total          Decimal     @db.Decimal(10, 2)
  promoId        String?
  promo          Promo?      @relation(fields: [promoId], references: [id], onDelete: SetNull)
  promoCode      String?                     // snapshot
  pointsEarned   Int         @default(0)
  pointsRedeemed Int         @default(0)
  orderNote      String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  @@index([userId, createdAt])
  @@index([status, createdAt])
  @@index([branchId, createdAt])
  @@index([createdAt])
}

model OrderItem {
  id                 String    @id @default(uuid())
  orderId            String
  order              Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId         String?
  menuItem           MenuItem? @relation(fields: [menuItemId], references: [id], onDelete: SetNull)
  legacyMenuItemId   Int?                    // snapshot for the mobile app
  name               String                  // snapshot
  price              Decimal   @db.Decimal(10, 2)  // snapshot
  qty                Int
  sugar              String?
  ice                String?
  @@index([orderId])
}
```

**Note on `Decimal`:** Prisma returns `Decimal` objects, not JS numbers. A response interceptor will serialise them to plain numbers so every existing frontend component (which expects `price: number`) keeps working untouched.

**Note on timestamps:** Convex used epoch-millisecond numbers; Postgres uses `DateTime`. The API serialises `createdAt`/`updatedAt` back to **epoch milliseconds** in responses, because the mobile app and admin dashboard do arithmetic on them (`order.createdAt >= start`, chart buckets). Zero frontend changes needed.

---

## 4. Feature → module → endpoint mapping

Every one of the 34 Convex functions, mapped. Auth column: `—` public, `Clerk` customer JWT, `Admin` session token, `Super` superadmin only.

### `health` module

| Convex | Method | Endpoint | Auth |
|---|---|---|---|
| `health.ping` | GET | `/api/health` | — |

Response keeps `{ ok, version, catalogReady }` so `useConvexBackendReady`'s gating logic ports 1:1 (`deployment` becomes the app name).

### `catalog` module (public read models)

| Convex | Method | Endpoint | Request | Auth |
|---|---|---|---|---|
| `catalog.listBranches` | GET | `/api/catalog/branches` | — | — |
| `catalog.listMenu` | GET | `/api/catalog/menu?category=` | query | — |
| `catalog.listCategories` | GET | `/api/catalog/categories` | — | — |
| `catalog.listPromos` | GET | `/api/catalog/promos` | — | — |
| `promos.validate` | POST | `/api/catalog/promos/validate` | `{ code, subtotal }` | — |

Only `active` rows, ordered by `sortOrder`. `listCategories` returns `['All', ...]` exactly as today.

### `users` module

| Convex | Method | Endpoint | Request | Auth |
|---|---|---|---|---|
| `users.me` | GET | `/api/users/me` | — | Clerk (nullable) |
| `users.requireMe` | GET | `/api/users/me?required=1` | — | Clerk |
| `users.upsertFromAuth` | POST | `/api/users/sync` | `{ name, email, pictureUrl? }` | Clerk |

### `orders` module (customer)

| Convex | Method | Endpoint | Request | Response | Auth |
|---|---|---|---|---|---|
| `orders.listMine` | GET | `/api/orders` | — | `Order[]` desc | Clerk |
| `orders.getMine` | GET | `/api/orders/:orderNumber` | — | `Order \| 404` | Clerk |
| `orders.create` | POST | `/api/orders` | `{ branchSlug, orderType, payMethod, items[], promoCode?, pointsToRedeem?, orderNote? }` | `{ orderId, orderNumber, total, pointsEarned }` | Clerk |
| `orders.cancelMine` | POST | `/api/orders/:orderNumber/cancel` | — | `204` | Clerk |

`POST /api/orders` runs inside a **Prisma interactive transaction**: price lines → apply promo → apply points → insert order + items → update user points/branch. Convex mutations were atomic by default; this restores that guarantee.

### `admin-auth` module

| Convex | Method | Endpoint | Request | Auth |
|---|---|---|---|---|
| `admins.login` | POST | `/api/admin/auth/login` | `{ username, password }` | — |
| `admins.logout` | POST | `/api/admin/auth/logout` | — | Admin |
| `admins.validateSession` / `admins.me` | GET | `/api/admin/auth/me` | — | Admin |
| `admins.listStaff` | GET | `/api/admin/staff` | — | Admin |
| `admins.createStaff` | POST | `/api/admin/staff` | `{ username, password, displayName, email, role }` | Super |
| `admins.updateStaff` | PATCH | `/api/admin/staff/:id` | partial + `password?` | Super |

The `adminToken` argument disappears from every request body and becomes an `Authorization: Bearer <token>` header, enforced by `AdminGuard` + `@SuperAdmin()` decorator.

### `admin-branches` module

| Convex | Method | Endpoint | Auth |
|---|---|---|---|
| `branches.listAll` | GET | `/api/admin/branches` | Admin |
| `branches.create` | POST | `/api/admin/branches` | Admin |
| `branches.update` | PATCH | `/api/admin/branches/:id` | Admin |

(No delete exists today; not adding one — parity.)

### `admin-menu` module

| Convex | Method | Endpoint | Auth |
|---|---|---|---|
| `menuAdmin.listAll` | GET | `/api/admin/menu?category=` | Admin |
| `menuAdmin.categories` | GET | `/api/admin/menu/categories` | Admin |
| `menuAdmin.create` | POST | `/api/admin/menu` | Admin |
| `menuAdmin.update` | PATCH | `/api/admin/menu/:id` | Admin |
| `menuAdmin.remove` | DELETE | `/api/admin/menu/:id` | Admin |

`DELETE` also destroys the Cloudinary asset and nulls `OrderItem.menuItemId` (`SetNull`) so historical orders survive.

### `admin-promos` module

| Convex | Method | Endpoint | Auth |
|---|---|---|---|
| `promosAdmin.listAll` | GET | `/api/admin/promos` | Admin |
| `promosAdmin.create` | POST | `/api/admin/promos` | Admin |
| `promosAdmin.update` | PATCH | `/api/admin/promos/:id` | Admin |
| `promosAdmin.remove` | DELETE | `/api/admin/promos/:id` | Admin |

### `admin-orders` module

| Convex | Method | Endpoint | Request | Auth |
|---|---|---|---|---|
| `ordersAdmin.list` | GET | `/api/admin/orders?status=` | query | Admin |
| `ordersAdmin.updateStatus` | PATCH | `/api/admin/orders/:id/status` | `{ status, trackingStep? }` | Admin |
| `ordersAdmin.advanceTracking` | POST | `/api/admin/orders/:id/advance` | — | Admin |
| `ordersAdmin.setTrackingStep` | PATCH | `/api/admin/orders/:id/tracking` | `{ trackingStep }` | Admin |

Cancelling refunds points inside the same transaction.

### `admin-customers` module

| Convex | Method | Endpoint | Request | Auth |
|---|---|---|---|---|
| `customersAdmin.listCustomers` | GET | `/api/admin/customers` | — | Admin |
| `customersAdmin.updateCustomer` | PATCH | `/api/admin/customers/:id` | `{ points?, suspended?, branchSlug? }` | Admin |

### `admin-dashboard` module

| Convex | Method | Endpoint | Auth |
|---|---|---|---|
| `adminDashboard.overview` | GET | `/api/admin/dashboard/overview` | Admin |

Convex loaded **every** order, user, menu item, promo and branch into memory to compute this. In Postgres this becomes `groupBy` / `count` / `sum` aggregates — same response shape, far cheaper.

### `cloudinary` module — NEW (no Convex equivalent)

| Method | Endpoint | Request | Response | Auth |
|---|---|---|---|---|
| POST | `/api/admin/uploads/image` | multipart `file` + `folder` ∈ `{menu, promos, branches}` | `{ imageUrl, publicId }` | Admin |
| DELETE | `/api/admin/uploads/image` | `{ publicId }` | `204` | Admin |

---

## 5. Cloudinary — image architecture

**Today:** admins paste an image URL into a text input. Nothing is uploaded; nothing is owned. `AdminMenuPage.tsx:241` ("Image URL"), `AdminPromosPage.tsx:136`, and the branches form.

**After:**

```
React (admin form, file picker)
  → POST /api/admin/uploads/image  (multipart)
    → CloudinaryService.upload(buffer, folder: 'kafe-eman/menu')
      → Cloudinary returns { secure_url, public_id }
        → response to React
          → React submits the entity form with { imageUrl, imagePublicId }
            → Prisma persists BOTH columns
              → Neon PostgreSQL
```

Rules:
- **Never** store binaries or base64 in Postgres. Only `imageUrl` (the `secure_url`) + `imagePublicId`.
- Three image owners, no extra tables — the columns live on the entity: `MenuItem`, `Promo`, `Branch`.
- No user profile image upload: `User.pictureUrl` comes from Clerk and is not ours to manage.
- **Orphan prevention:** on entity update, if `imagePublicId` changes, the old asset is destroyed after the DB write commits. On entity delete, the asset is destroyed. Both are best-effort and logged — a Cloudinary failure must never roll back a successful DB write.
- Validation: `image/*` only, 5 MB cap, folder allowlist.
- Existing Unsplash URLs in seed data keep working (`imagePublicId` stays null → nothing to clean up).

---

## 6. The one real fidelity risk: reactivity

Convex `useQuery` is **live** — a websocket push. REST is not. Affected screens:

| Screen | Today | Plan |
|---|---|---|
| Mobile order tracking | step advances the moment an admin clicks | poll `GET /api/orders` every **5 s** while the tracking screen is mounted |
| Mobile catalog | admin menu edits appear instantly | fetch on mount + on app foreground |
| Admin orders processing/track | live queue | poll every **5 s** |
| Admin dashboard | live KPIs | poll every **30 s** |

Implemented once in a shared `useApiQuery(key, fetcher, { refetchInterval })` hook whose return shape matches Convex's (`data === undefined` while loading), so page code changes by an import line, not a rewrite. SSE (`GET /api/orders/stream`) can be layered on later without touching components.

---

## 7. Frontend changes required

The hook signatures are being kept identical on purpose, so **App.tsx's 2772 lines of UI are untouched** except its import block.

### Mobile — `src/features/kafeeman/`

| File | Action |
|---|---|
| `convex/ConvexClientProvider.tsx` | → `api/ApiProvider.tsx` (base URL, Clerk token attach) |
| `convex/ConvexSafeProvider.tsx` | → `api/SafeModeProvider.tsx` (keep offline fallback verbatim) |
| `convex/useConvexBackendStatus.ts` | → `api/useBackendStatus.ts` (`GET /api/health`) |
| `convex/useConvexCatalog.ts` | → `api/useCatalog.ts` |
| `convex/useConvexBackend.ts` | → `api/useOrders.ts` + `api/useCurrentUser.ts` |
| `convex/useConvexUserSync.ts` | → `api/useUserSync.ts` (`POST /api/users/sync`) |
| `convex/useConvexConnection.ts` | → `api/useBackendConnection.ts` |
| `convex/adapters.ts` | keep; swap `Doc<'orders'>` import for a local `ApiOrder` type |
| **new** `api/client.ts` | fetch wrapper: base URL, bearer token, error normalisation |
| **new** `api/useApiQuery.ts` | polling query hook |
| `App.tsx` | **imports at 111–115 and call sites at 222–229, 456, 590 only** |

### Admin — `Admin/src/`

| File | Action |
|---|---|
| `providers/ConvexProvider.tsx` | → `providers/ApiProvider.tsx` (+ `hasApi()`, `ApiSetupNotice`) |
| **new** `lib/apiClient.ts`, `lib/useApiQuery.ts`, `lib/useApiMutation.ts` | Convex-shaped hooks |
| `admin/auth.ts` | `revokeAdminSession` calls the API instead of a Convex mutation |
| `admin/AdminLayout.tsx`, `components/AdminTopbar.tsx` | swap hooks |
| `pages/`: Account, Branches, Customers, Dashboard, Login, Menu, Promos, Staff | swap hooks; `adminToken` moves from args to header |
| `pages/orders/`: Shared, Processing, Track, History | swap hooks |
| Menu / Promos / Branches forms | replace the "Image URL" text input with a Cloudinary file-upload control |
| `vite.config.ts` | drop `@convex` alias + `VITE_CONVEX_URL`; add `VITE_API_URL` |
| `main.tsx` | `AppConvexProvider` → `ApiProvider` |

### Convex removal (final step, only after verification)

- delete `convex/` (incl. `_generated/`)
- `package.json`: drop `convex` dep + `convex:dev` / `convex:deploy` / `convex:seed` scripts
- `Admin/package.json`: drop `convex` dep
- `.env.example` / `.env.local`: drop `CONVEX_DEPLOYMENT`, `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_CONVEX_SITE_URL`
- `tsconfig.json` + `Admin/tsconfig.app.json`: drop `@/convex` / `@convex` path aliases
- `scripts/dev.mjs`: drop any Convex orchestration
- README / docs: update

---

## 8. Backend structure

```
backend/
├── src/
│   ├── main.ts                     # CORS, ValidationPipe, /api prefix, Decimal+Date serializer
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/             # @CurrentUser, @CurrentAdmin, @SuperAdmin, @Public
│   │   ├── filters/                # HttpExceptionFilter → consistent { statusCode, message }
│   │   ├── interceptors/           # Decimal→number, Date→epoch ms
│   │   └── order-rules.ts          # verbatim port of convex/lib/orderRules.ts
│   ├── config/                     # @nestjs/config + env schema validation (fail fast)
│   ├── database/                   # PrismaModule + PrismaService (onModuleInit connect)
│   ├── cloudinary/                 # CloudinaryModule/Service/Controller
│   ├── auth/
│   │   ├── clerk/                  # JWKS verify → ClerkGuard  (customers)
│   │   └── admin/                  # PBKDF2 + session tokens → AdminGuard, SuperAdminGuard
│   ├── health/
│   ├── catalog/                    # public branches/menu/categories/promos + validate
│   ├── users/
│   ├── orders/                     # customer orders
│   └── admin/
│       ├── admin-auth/  admin-staff/  admin-branches/  admin-menu/
│       ├── admin-promos/  admin-orders/  admin-customers/  admin-dashboard/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                     # port of convex/seed.ts (branches, menu, promos, default admin)
├── .env  /  .env.example
├── package.json                    # bun only
└── tsconfig.json
```

Every mutating endpoint gets a `class-validator` DTO. Status codes: `200` read, `201` create, `204` delete/void, `400` validation, `401` unauthenticated, `403` wrong role, `404` missing, `409` duplicate slug/code/username.

---

## 9. Environment variables

`backend/.env`:

```
DATABASE_URL=            # Neon pooled (-pooler host)   — runtime
DIRECT_URL=              # Neon direct (no -pooler)     — prisma migrate
PORT=4000
CORS_ORIGINS=http://localhost:5173,http://localhost:8081

CLERK_JWT_ISSUER=        # https://YOUR-INSTANCE.clerk.accounts.dev
CLERK_JWKS_URL=          # <issuer>/.well-known/jwks.json
CLERK_JWT_AUDIENCE=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=kafe-eman

ADMIN_SESSION_TTL_DAYS=7
SEED_ADMIN_USERNAME=
SEED_ADMIN_PASSWORD=
```

Frontend additions: `EXPO_PUBLIC_API_URL` (mobile) and `VITE_API_URL` (admin). No secret ever lands in source; `.env` is gitignored, `.env.example` holds empty keys only.

---

## 10. Execution order

| # | Phase | Deliverable |
|---|---|---|
| 1 | Scaffold | `backend/` NestJS + Bun, config module, health endpoint |
| 2 | Prisma + Neon | schema, first migration applied to Neon, PrismaService |
| 3 | Seed | `prisma/seed.ts` — branches, menu, promos, default admin |
| 4 | Business rules | `common/order-rules.ts` ported + unit-tested against the Convex values |
| 5 | Auth | ClerkGuard (JWKS) + AdminGuard (PBKDF2/sessions) |
| 6 | Public modules | health, catalog, promo validate |
| 7 | Customer modules | users, orders (transactional create/cancel) |
| 8 | Admin modules | auth, staff, branches, menu, promos, orders, customers, dashboard |
| 9 | Cloudinary | upload/destroy + wire into menu/promos/branches services |
| 10 | Admin frontend | api client + hooks, swap 14 files, add upload UI |
| 11 | Mobile frontend | api client + hooks, swap 8 files + App.tsx imports |
| 12 | Verify | every flow below, end to end |
| 13 | Remove Convex | delete `convex/`, deps, scripts, env, aliases |
| 14 | Final pass | `bun run typecheck` + `bun run lint` in both projects, README update |

### Verification checklist (phase 12)

Customer: sign in (Clerk) → user row created → browse live menu/branches/promos → add to cart with sugar/ice → apply promo code → redeem points → place delivery order → totals match server → order appears in Orders → cancel while preparing → points refunded → place pickup order → admin advances tracking → mobile tracking screen updates within 5 s → receipt correct.
Admin: login → dashboard KPIs match DB → create/edit/delete menu item **with Cloudinary upload** → verify `imageUrl` in Neon is a `res.cloudinary.com` URL → replace image → old asset gone from Cloudinary → same for promos and branches → orders processing/track/history → suspend a customer → suspended customer cannot order → adjust points → staff CRUD as superadmin → staff role blocked from staff management → logout invalidates session.
Offline: kill the backend → mobile still renders the local seed catalog (safe mode intact).

---

## 11. Decisions — SETTLED

1. **Backend location** → `mobile/backend`. Same git repo as the app and `Admin/`.
2. **Customer auth** → **keep Clerk**; NestJS verifies the Clerk JWT via JWKS in a `ClerkGuard`. No auth screens change; Apple Sign-In and the token cache are untouched.
3. **Existing data** → **start fresh from seed**. No Convex export. `prisma/seed.ts` creates branches, menu items, promos and the default admin.
4. **Groq** → an AI feature is planned but not yet specified. `GROQ_API_KEY` is added to `backend/.env` / `.env.example` and wired into the config module so it validates, but **no feature is built against it in this migration**. Scope it separately once defined.

## 12. Security note

The Neon connection string, Cloudinary API secret, and Groq key were shared in plaintext chat. Rotate all three after the migration (Neon: reset the `neondb_owner` password; Cloudinary: regenerate the API secret; Groq: revoke and reissue). The `DIRECT_URL` for Prisma migrations is the same host with `-pooler` removed.
