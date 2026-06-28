import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { hashToken } from './password';

type Ctx = QueryCtx | MutationCtx;

export type AdminRole = 'superadmin' | 'staff';

export function normalizeAdminRole(role: string): AdminRole {
  if (role === 'superadmin') return 'superadmin';
  return 'staff';
}

export function isSuperAdmin(admin: Pick<Doc<'admins'>, 'role'>) {
  return normalizeAdminRole(admin.role) === 'superadmin';
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionExpiresAt(from = Date.now()) {
  return from + SESSION_TTL_MS;
}

export async function requireAdmin(ctx: Ctx, adminToken: string | undefined) {
  if (!adminToken?.trim()) {
    throw new Error('Admin authentication required.');
  }

  const tokenHash = await hashToken(adminToken.trim());
  const session = await ctx.db
    .query('adminSessions')
    .withIndex('by_token_hash', (q) => q.eq('tokenHash', tokenHash))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error('Invalid or expired admin session.');
  }

  const admin = await ctx.db.get('admins', session.adminId);
  if (!admin || !admin.active) {
    throw new Error('Admin account is inactive.');
  }

  return { admin, session };
}

export async function requireSuperAdmin(ctx: Ctx, adminToken: string | undefined) {
  const result = await requireAdmin(ctx, adminToken);
  if (!isSuperAdmin(result.admin)) {
    throw new Error('Only a super admin can perform this action.');
  }
  return result;
}
