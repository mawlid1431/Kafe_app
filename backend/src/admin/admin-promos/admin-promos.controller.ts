import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/admin/admin.guard';
import { AdminPromosService } from './admin-promos.service';
import { CreatePromoDto, UpdatePromoDto } from './dto/promo.dto';

@Controller('admin/promos')
@UseGuards(AdminGuard)
export class AdminPromosController {
  constructor(private readonly promos: AdminPromosService) {}

  @Get()
  listAll() {
    return this.promos.listAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePromoDto) {
    return this.promos.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdatePromoDto): Promise<void> {
    await this.promos.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.promos.remove(id);
  }
}
