import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { ClerkIdentity } from '../auth/clerk/clerk.service';
import type { SyncUserDto } from './dto/sync-user.dto';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  pictureUrl?: string;
  branchSlug?: string;
  points: number;
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  static toPublic(user: User & { branch?: { slug: string } | null }): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      pictureUrl: user.pictureUrl ?? undefined,
      branchSlug: user.branch?.slug ?? undefined,
      points: user.points,
      suspended: user.suspended,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /** No row yet is a normal state, not an error. */
  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
      include: { branch: { select: { slug: true } } },
    });
  }

  /** Throws when the identity has no local row. */
  async requireByClerkId(clerkId: string) {
    const user = await this.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Called by the app once per Clerk session to project the Clerk profile
   * into our own users table.
   */
  async syncFromAuth(identity: ClerkIdentity, dto: SyncUserDto): Promise<PublicUser> {
    const email = (dto.email || identity.email || '').trim().toLowerCase();
    const name = dto.name.trim() || identity.name?.trim() || email.split('@')[0] || 'Guest';
    const pictureUrl = dto.pictureUrl ?? identity.pictureUrl;

    const user = await this.prisma.user.upsert({
      where: { clerkId: identity.clerkId },
      create: { clerkId: identity.clerkId, email, name, pictureUrl },
      update: { email, name, pictureUrl },
      include: { branch: { select: { slug: true } } },
    });

    return UsersService.toPublic(user);
  }
}
