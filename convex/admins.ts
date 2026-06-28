import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  isSuperAdmin,
  normalizeAdminRole,
  requireAdmin,
  requireSuperAdmin,
  sessionExpiresAt,
} from './lib/adminAuth';
import { generateSecureToken, hashPassword, hashToken, verifyPassword } from './lib/password';

const adminTokenArg = { adminToken: v.string() };

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  returns: v.object({
    token: v.string(),
    expiresAt: v.number(),
    admin: v.object({
      id: v.id('admins'),
      username: v.string(),
      displayName: v.string(),
      email: v.string(),
      role: v.union(v.literal('superadmin'), v.literal('staff')),
    }),
  }),
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    if (!username || !args.password) {
      throw new Error('Username and password are required.');
    }

    const admin = await ctx.db
      .query('admins')
      .withIndex('by_username', (q) => q.eq('username', username))
      .unique();

    if (!admin || !admin.active) {
      throw new Error('Invalid username or password.');
    }

    const valid = await verifyPassword(args.password, admin.passwordHash, admin.passwordSalt);
    if (!valid) {
      throw new Error('Invalid username or password.');
    }

    const token = generateSecureToken();
    const tokenHash = await hashToken(token);
    const now = Date.now();
    const expiresAt = sessionExpiresAt(now);

    await ctx.db.insert('adminSessions', {
      adminId: admin._id,
      tokenHash,
      expiresAt,
      createdAt: now,
    });

    await ctx.db.patch('admins', admin._id, { updatedAt: now });

    return {
      token,
      expiresAt,
      admin: {
        id: admin._id,
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        role: normalizeAdminRole(admin.role),
      },
    };
  },
});

export const logout = mutation({
  args: adminTokenArg,
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const tokenHash = await hashToken(args.adminToken.trim());
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token_hash', (q) => q.eq('tokenHash', tokenHash))
      .unique();

    if (session) {
      await ctx.db.delete('adminSessions', session._id);
    }
    return { ok: true };
  },
});

export const validateSession = query({
  args: adminTokenArg,
  returns: v.union(
    v.object({
      id: v.id('admins'),
      username: v.string(),
      displayName: v.string(),
      email: v.string(),
      role: v.union(v.literal('superadmin'), v.literal('staff')),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const { admin } = await requireAdmin(ctx, args.adminToken);
      return {
        id: admin._id,
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        role: normalizeAdminRole(admin.role),
      };
    } catch {
      return null;
    }
  },
});

export const listStaff = query({
  args: adminTokenArg,
  returns: v.array(
    v.object({
      _id: v.id('admins'),
      username: v.string(),
      displayName: v.string(),
      email: v.string(),
      role: v.union(v.literal('superadmin'), v.literal('staff')),
      active: v.boolean(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken);
    const rows = await ctx.db.query('admins').collect();
    return rows
      .map((a) => ({
        _id: a._id,
        username: a.username,
        displayName: a.displayName,
        email: a.email,
        role: normalizeAdminRole(a.role),
        active: a.active,
        createdAt: a.createdAt,
      }))
      .sort((a, b) => a.username.localeCompare(b.username));
  },
});

export const createStaff = mutation({
  args: {
    adminToken: v.string(),
    username: v.string(),
    password: v.string(),
    displayName: v.string(),
    email: v.string(),
    role: v.union(v.literal('superadmin'), v.literal('staff')),
  },
  returns: v.id('admins'),
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.adminToken);

    const username = args.username.trim().toLowerCase();
    if (!username || args.password.length < 8) {
      throw new Error('Username required and password must be at least 8 characters.');
    }

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_username', (q) => q.eq('username', username))
      .unique();
    if (existing) {
      throw new Error('Username already exists.');
    }

    const { hash, salt } = await hashPassword(args.password);
    const now = Date.now();
    return await ctx.db.insert('admins', {
      username,
      passwordHash: hash,
      passwordSalt: salt,
      displayName: args.displayName.trim(),
      email: args.email.trim(),
      role: args.role,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStaff = mutation({
  args: {
    adminToken: v.string(),
    adminId: v.id('admins'),
    displayName: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal('superadmin'), v.literal('staff'))),
    active: v.optional(v.boolean()),
    password: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { admin: actor } = await requireSuperAdmin(ctx, args.adminToken);
    const target = await ctx.db.get('admins', args.adminId);
    if (!target) throw new Error('Staff member not found.');

    if (target._id === actor._id && args.active === false) {
      throw new Error('You cannot deactivate your own account.');
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.displayName !== undefined) patch.displayName = args.displayName.trim();
    if (args.email !== undefined) patch.email = args.email.trim();
    if (args.role !== undefined) patch.role = args.role;
    if (args.active !== undefined) patch.active = args.active;

    if (args.password) {
      if (args.password.length < 8) throw new Error('Password must be at least 8 characters.');
      const { hash, salt } = await hashPassword(args.password);
      patch.passwordHash = hash;
      patch.passwordSalt = salt;
    }

    await ctx.db.patch('admins', args.adminId, patch);
    return null;
  },
});

export const me = query({
  args: adminTokenArg,
  returns: v.union(
    v.object({
      id: v.id('admins'),
      username: v.string(),
      displayName: v.string(),
      email: v.string(),
      role: v.union(v.literal('superadmin'), v.literal('staff')),
      isSuperAdmin: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const { admin } = await requireAdmin(ctx, args.adminToken);
      return {
        id: admin._id,
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        role: normalizeAdminRole(admin.role),
        isSuperAdmin: isSuperAdmin(admin),
      };
    } catch {
      return null;
    }
  },
});
