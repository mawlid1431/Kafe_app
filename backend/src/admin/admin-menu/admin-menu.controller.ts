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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/admin/admin.guard';
import { AdminMenuService } from './admin-menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';

@Controller('admin/menu')
@UseGuards(AdminGuard)
export class AdminMenuController {
  constructor(private readonly menu: AdminMenuService) {}

  // Declared before ':id' routes so "categories" is not swallowed as an id.
  @Get('categories')
  categories() {
    return this.menu.categories();
  }

  @Get()
  listAll(@Query('category') category?: string) {
    return this.menu.listAll(category);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMenuItemDto) {
    return this.menu.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto): Promise<void> {
    await this.menu.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.menu.remove(id);
  }
}
