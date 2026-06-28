import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const adminRole = v.union(v.literal('superadmin'), v.literal('staff'));

const orderLineItem = v.object({
  menuItemId: v.optional(v.number()),
  name: v.string(),
  price: v.number(),
  qty: v.number(),
  sugar: v.optional(v.string()),
  ice: v.optional(v.string()),
});

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    branchSlug: v.optional(v.string()),
    points: v.optional(v.number()),
    suspended: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_email', ['email'])
    .index('by_created', ['createdAt']),

  admins: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    displayName: v.string(),
    email: v.string(),
    role: adminRole,
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_username', ['username']),

  adminSessions: defineTable({
    adminId: v.id('admins'),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index('by_token_hash', ['tokenHash']),

  branches: defineTable({
    slug: v.string(),
    label: v.string(),
    address: v.string(),
    hours: v.string(),
    imageUrl: v.optional(v.string()),
    lat: v.number(),
    lng: v.number(),
    active: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_sort', ['sortOrder']),

  menuItems: defineTable({
    legacyId: v.optional(v.number()),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    rating: v.optional(v.number()),
    calories: v.optional(v.number()),
    badge: v.optional(v.string()),
    active: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_category_sort', ['category', 'sortOrder'])
    .index('by_sort', ['sortOrder']),

  orders: defineTable({
    orderNumber: v.string(),
    userId: v.optional(v.id('users')),
    branchSlug: v.string(),
    branchLabel: v.string(),
    orderType: v.union(v.literal('delivery'), v.literal('pickup')),
    payMethod: v.union(v.literal('tng'), v.literal('card'), v.literal('banking')),
    status: v.union(v.literal('active'), v.literal('delivered'), v.literal('cancelled')),
    trackingStep: v.number(),
    items: v.array(orderLineItem),
    subtotal: v.number(),
    discount: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    promoCode: v.optional(v.string()),
    pointsEarned: v.optional(v.number()),
    pointsRedeemed: v.optional(v.number()),
    orderNote: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_order_number', ['orderNumber'])
    .index('by_status_created', ['status', 'createdAt'])
    .index('by_branch_created', ['branchSlug', 'createdAt'])
    .index('by_created', ['createdAt'])
    .index('by_user_created', ['userId', 'createdAt']),

  promos: defineTable({
    title: v.string(),
    subtitle: v.string(),
    code: v.string(),
    imageUrl: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    fixedOff: v.optional(v.number()),
    minSpend: v.optional(v.number()),
    active: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_code', ['code'])
    .index('by_sort', ['sortOrder']),
});
