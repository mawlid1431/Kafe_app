import { Global, Module } from '@nestjs/common';
import { AdminSessionService } from './admin/admin-session.service';
import { AdminGuard } from './admin/admin.guard';
import { ClerkService } from './clerk/clerk.service';
import { ClerkGuard, OptionalClerkGuard } from './clerk/clerk.guard';

/**
 * Two independent authentication systems, exactly as before the migration:
 *  • Clerk JWT       → app customers
 *  • Session tokens  → dashboard admins
 * They share no identity surface.
 */
@Global()
@Module({
  providers: [AdminSessionService, AdminGuard, ClerkService, ClerkGuard, OptionalClerkGuard],
  exports: [AdminSessionService, AdminGuard, ClerkService, ClerkGuard, OptionalClerkGuard],
})
export class AuthModule {}
