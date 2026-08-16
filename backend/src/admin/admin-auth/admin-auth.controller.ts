import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Admin } from '@prisma/client';
import type { Request } from 'express';
import { AdminGuard, bearerToken } from '../../auth/admin/admin.guard';
import { CurrentAdmin } from '../../auth/admin/current-admin.decorator';
import { SuperAdminOnly } from '../../auth/admin/super-admin.decorator';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, CreateStaffDto, UpdateStaffDto } from './dto/admin-auth.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto) {
    return this.auth.login(dto);
  }

  /** Not guarded: logging out with an already-invalid token must still succeed. */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: Request): Promise<void> {
    await this.auth.logout(bearerToken(request));
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@CurrentAdmin() admin: Admin) {
    return this.auth.me(admin);
  }
}

@Controller('admin/staff')
@UseGuards(AdminGuard)
export class AdminStaffController {
  constructor(private readonly auth: AdminAuthService) {}

  @Get()
  listStaff() {
    return this.auth.listStaff();
  }

  @Post()
  @SuperAdminOnly()
  @HttpCode(HttpStatus.CREATED)
  createStaff(@Body() dto: CreateStaffDto) {
    return this.auth.createStaff(dto);
  }

  @Patch(':id')
  @SuperAdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStaff(
    @CurrentAdmin() actor: Admin,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<void> {
    await this.auth.updateStaff(actor, id, dto);
  }
}
