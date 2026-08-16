import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { Env } from '../../config/env';

export type ClerkIdentity = {
  /** Clerk user id (`sub`). Stored as User.clerkId. */
  clerkId: string;
  email?: string;
  name?: string;
  pictureUrl?: string;
};

/**
 * Verifies the Clerk session JWT the mobile app obtains from its configured
 * JWT template. The signature is checked against Clerk's public JWKS, so the
 * backend never needs a Clerk secret key.
 */
@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience?: string;

  constructor(config: ConfigService<Env, true>) {
    this.issuer = config.get('CLERK_JWT_ISSUER', { infer: true });
    this.audience = config.get('CLERK_JWT_AUDIENCE', { infer: true }) || undefined;
    this.jwks = createRemoteJWKSet(new URL(config.get('CLERK_JWKS_URL', { infer: true })));
  }

  async verify(token: string): Promise<ClerkIdentity> {
    let payload: JWTPayload;
    try {
      const result = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        ...(this.audience ? { audience: this.audience } : {}),
      });
      payload = result.payload;
    } catch (error) {
      this.logger.debug(`Clerk token rejected: ${(error as Error).message}`);
      throw new UnauthorizedException('Not authenticated');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Not authenticated');
    }

    const claims = payload as JWTPayload & {
      email?: string;
      name?: string;
      picture?: string;
      image_url?: string;
    };

    return {
      clerkId: payload.sub,
      email: claims.email,
      name: claims.name,
      pictureUrl: claims.picture ?? claims.image_url,
    };
  }
}
