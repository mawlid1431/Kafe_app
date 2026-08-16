import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_KEY = 'kafeeman:superAdminOnly';

/** Restricts a route (or a whole controller) to `SUPERADMIN`. Enforced by AdminGuard. */
export const SuperAdminOnly = () => SetMetadata(SUPER_ADMIN_KEY, true);
