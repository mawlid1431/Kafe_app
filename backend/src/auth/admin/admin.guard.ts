import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AdminSessionService } from './admin-session.service';
import { SUPER_ADMIN_KEY } from './super-admin.decorator';

export function bearerToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (!value || scheme.toLowerCase() !== 'bearer') return undefined;
  return value.trim();
}

/**
 * Resolves the admin session token from the Authorization header and attaches
 * the operator to the request. Rejects expired, revoked or inactive sessions.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly sessions: AdminSessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const admin = await this.sessions.resolve(bearerToken(request));

    const superAdminOnly = this.reflector.getAllAndOverride<boolean>(SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (superAdminOnly && admin.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Only a super admin can perform this action.');
    }

    (request as Request & { admin?: typeof admin }).admin = admin;
    return true;
  }
}
