import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Admin, AdminRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { Env } from '../../config/env';
import { generateSecureToken, hashToken } from './password.util';

export type AuthenticatedAdmin = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: AdminRole;
};

export function toAuthenticatedAdmin(admin: Admin): AuthenticatedAdmin {
  return {
    id: admin.id,
    username: admin.username,
    displayName: admin.displayName,
    email: admin.email,
    role: admin.role,
  };
}

@Injectable()
export class AdminSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private ttlMs(): number {
    return this.config.get('ADMIN_SESSION_TTL_DAYS', { infer: true }) * 24 * 60 * 60 * 1000;
  }

  /** Issues a new session and returns the raw token — the only time it exists in plaintext. */
  async issue(adminId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + this.ttlMs());

    await this.prisma.adminSession.create({
      data: { adminId, tokenHash: hashToken(token), expiresAt },
    });

    return { token, expiresAt };
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  /** Resolves a bearer token to an active admin, or throws 401. */
  async resolve(token: string | undefined): Promise<Admin> {
    const trimmed = token?.trim();
    if (!trimmed) {
      throw new UnauthorizedException('Admin authentication required.');
    }

    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(trimmed) },
      include: { admin: true },
    });

    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Invalid or expired admin session.');
    }

    if (!session.admin.active) {
      throw new UnauthorizedException('Admin account is inactive.');
    }

    return session.admin;
  }

  /** Housekeeping — safe to call opportunistically. */
  async purgeExpired(): Promise<number> {
    const { count } = await this.prisma.adminSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return count;
  }
}
