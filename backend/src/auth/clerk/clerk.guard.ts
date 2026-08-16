import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { bearerToken } from '../admin/admin.guard';
import { ClerkService, type ClerkIdentity } from './clerk.service';

export type RequestWithIdentity = Request & { identity?: ClerkIdentity };

/** Requires a valid Clerk JWT and attaches the identity to the request. */
@Injectable()
export class ClerkGuard implements CanActivate {
  constructor(private readonly clerk: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithIdentity>();
    const token = bearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }
    request.identity = await this.clerk.verify(token);
    return true;
  }
}

/**
 * Attaches the identity when a valid token is present, but never rejects.
 * Used by endpoints like `GET /api/users/me`, which answer `null` for an
 * anonymous caller rather than erroring.
 */
@Injectable()
export class OptionalClerkGuard implements CanActivate {
  constructor(private readonly clerk: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithIdentity>();
    const token = bearerToken(request);
    if (token) {
      try {
        request.identity = await this.clerk.verify(token);
      } catch {
        request.identity = undefined;
      }
    }
    return true;
  }
}
