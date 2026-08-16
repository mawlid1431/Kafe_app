import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Admin, AdminRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AdminSessionService } from '../../auth/admin/admin-session.service';
import { hashPassword, verifyPassword } from '../../auth/admin/password.util';
import type { AdminLoginDto, CreateStaffDto, UpdateStaffDto } from './dto/admin-auth.dto';

/** Wire format keeps the lowercase role strings the dashboard already renders. */
export const ROLE_TO_API = { SUPERADMIN: 'superadmin', STAFF: 'staff' } as const;

export function toApiRole(role: AdminRole): 'superadmin' | 'staff' {
  return ROLE_TO_API[role];
}

export function toDbRole(role: 'superadmin' | 'staff'): AdminRole {
  return role === 'superadmin' ? 'SUPERADMIN' : 'STAFF';
}

function toApiAdmin(admin: Admin) {
  return {
    id: admin.id,
    username: admin.username,
    displayName: admin.displayName,
    email: admin.email,
    role: toApiRole(admin.role),
    isSuperAdmin: admin.role === 'SUPERADMIN',
  };
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: AdminSessionService,
  ) {}

  /** Authenticates an operator and issues a session token. */
  async login(dto: AdminLoginDto) {
    const username = dto.username.trim().toLowerCase();

    const admin = await this.prisma.admin.findUnique({ where: { username } });

    // Same message for unknown user, wrong password and deactivated account —
    // never reveal which of the three it was.
    const invalid = new UnauthorizedException('Invalid username or password.');
    if (!admin || !admin.active) throw invalid;

    const valid = await verifyPassword(dto.password, admin.passwordHash, admin.passwordSalt);
    if (!valid) throw invalid;

    const { token, expiresAt } = await this.sessions.issue(admin.id);
    void this.sessions.purgeExpired();

    return {
      token,
      expiresAt,
      admin: {
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        role: toApiRole(admin.role),
      },
    };
  }

  /** Revokes a session token. Idempotent. */
  async logout(token: string | undefined): Promise<void> {
    if (token) await this.sessions.revoke(token);
  }

  /** The currently authenticated operator. */
  me(admin: Admin) {
    return toApiAdmin(admin);
  }

  /** All operators, alphabetical by username. */
  async listStaff() {
    const rows = await this.prisma.admin.findMany({ orderBy: { username: 'asc' } });
    return rows.map((a) => ({
      id: a.id,
      username: a.username,
      displayName: a.displayName,
      email: a.email,
      role: toApiRole(a.role),
      active: a.active,
      createdAt: a.createdAt,
    }));
  }

  /** Creates an operator — superadmin only (enforced by the guard). */
  async createStaff(dto: CreateStaffDto) {
    const username = dto.username.trim().toLowerCase();
    if (!username) {
      throw new BadRequestException('Username is required.');
    }

    const existing = await this.prisma.admin.findUnique({ where: { username } });
    if (existing) {
      throw new ConflictException('Username already exists.');
    }

    const { hash, salt } = await hashPassword(dto.password);
    const created = await this.prisma.admin.create({
      data: {
        username,
        passwordHash: hash,
        passwordSalt: salt,
        displayName: dto.displayName.trim(),
        email: dto.email.trim(),
        role: toDbRole(dto.role),
        active: true,
      },
    });

    return { id: created.id };
  }

  /** Updates an operator — superadmin only. */
  async updateStaff(actor: Admin, adminId: string, dto: UpdateStaffDto): Promise<void> {
    const target = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!target) {
      throw new NotFoundException('Staff member not found.');
    }

    if (target.id === actor.id && dto.active === false) {
      throw new BadRequestException('You cannot deactivate your own account.');
    }

    const data: Prisma.AdminUpdateInput = {};
    if (dto.displayName !== undefined) data.displayName = dto.displayName.trim();
    if (dto.email !== undefined) data.email = dto.email.trim();
    if (dto.role !== undefined) data.role = toDbRole(dto.role);
    if (dto.active !== undefined) data.active = dto.active;

    if (dto.password) {
      const { hash, salt } = await hashPassword(dto.password);
      data.passwordHash = hash;
      data.passwordSalt = salt;
    }

    await this.prisma.admin.update({ where: { id: adminId }, data });

    // Deactivation or a password change must invalidate live sessions.
    if (dto.active === false || dto.password) {
      await this.prisma.adminSession.deleteMany({ where: { adminId } });
    }
  }
}
