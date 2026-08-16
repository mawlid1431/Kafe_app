import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/admin/admin.guard';
import { AdminOrdersService } from './admin-orders.service';
import { SetTrackingStepDto, UpdateOrderStatusDto } from './dto/admin-order.dto';

@Controller('admin/orders')
@UseGuards(AdminGuard)
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.orders.list(status);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto): Promise<void> {
    await this.orders.updateStatus(id, dto);
  }

  @Post(':id/advance')
  @HttpCode(HttpStatus.NO_CONTENT)
  async advance(@Param('id') id: string): Promise<void> {
    await this.orders.advanceTracking(id);
  }

  @Patch(':id/tracking')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setTracking(@Param('id') id: string, @Body() dto: SetTrackingStepDto): Promise<void> {
    await this.orders.setTrackingStep(id, dto);
  }
}
