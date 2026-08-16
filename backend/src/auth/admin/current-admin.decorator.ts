import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Admin } from '@prisma/client';
import type { Request } from 'express';

/** The admin resolved by AdminGuard. Only valid on routes guarded by it. */
export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext): Admin => {
  const request = ctx.switchToHttp().getRequest<Request & { admin: Admin }>();
  return request.admin;
});
