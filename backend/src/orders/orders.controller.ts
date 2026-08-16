import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClerkGuard } from '../auth/clerk/clerk.guard';
import { CurrentIdentity } from '../auth/clerk/current-identity.decorator';
import type { ClerkIdentity } from '../auth/clerk/clerk.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(ClerkGuard)
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly users: UsersService,
  ) {}

  @Get()
  async listMine(@CurrentIdentity() identity: ClerkIdentity) {
    const user = await this.users.requireByClerkId(identity.clerkId);
    return this.orders.listMine(user.id);
  }

  @Get(':orderNumber')
  async getMine(
    @CurrentIdentity() identity: ClerkIdentity,
    @Param('orderNumber') orderNumber: string,
  ) {
    const user = await this.users.requireByClerkId(identity.clerkId);
    return this.orders.getMine(user.id, orderNumber);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentIdentity() identity: ClerkIdentity, @Body() dto: CreateOrderDto) {
    const user = await this.users.requireByClerkId(identity.clerkId);
    return this.orders.create(user.id, dto);
  }

  @Post(':orderNumber/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
    @CurrentIdentity() identity: ClerkIdentity,
    @Param('orderNumber') orderNumber: string,
  ): Promise<void> {
    const user = await this.users.requireByClerkId(identity.clerkId);
    await this.orders.cancelMine(user.id, orderNumber);
  }
}
