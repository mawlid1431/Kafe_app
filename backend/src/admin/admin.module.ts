import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';

import { AdminAuthController, AdminStaffController } from './admin-auth/admin-auth.controller';
import { AdminAuthService } from './admin-auth/admin-auth.service';
import { AdminBranchesController } from './admin-branches/admin-branches.controller';
import { AdminBranchesService } from './admin-branches/admin-branches.service';
import { AdminMenuController } from './admin-menu/admin-menu.controller';
import { AdminMenuService } from './admin-menu/admin-menu.service';
import { AdminPromosController } from './admin-promos/admin-promos.controller';
import { AdminPromosService } from './admin-promos/admin-promos.service';
import { AdminOrdersController } from './admin-orders/admin-orders.controller';
import { AdminOrdersService } from './admin-orders/admin-orders.service';
import { AdminCustomersController } from './admin-customers/admin-customers.controller';
import { AdminCustomersService } from './admin-customers/admin-customers.service';
import { AdminDashboardController } from './admin-dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard/admin-dashboard.service';

/** Everything behind an admin session token. */
@Module({
  imports: [OrdersModule],
  controllers: [
    AdminAuthController,
    AdminStaffController,
    AdminBranchesController,
    AdminMenuController,
    AdminPromosController,
    AdminOrdersController,
    AdminCustomersController,
    AdminDashboardController,
  ],
  providers: [
    AdminAuthService,
    AdminBranchesService,
    AdminMenuService,
    AdminPromosService,
    AdminOrdersService,
    AdminCustomersService,
    AdminDashboardService,
  ],
})
export class AdminModule {}
