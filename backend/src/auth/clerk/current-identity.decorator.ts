import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ClerkIdentity } from './clerk.service';
import type { RequestWithIdentity } from './clerk.guard';

/** The Clerk identity resolved by ClerkGuard / OptionalClerkGuard. */
export const CurrentIdentity = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkIdentity | undefined =>
    ctx.switchToHttp().getRequest<RequestWithIdentity>().identity,
);
