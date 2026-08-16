import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin/admin.guard';
import { AdminBranchesService } from './admin-branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Controller('admin/branches')
@UseGuards(AdminGuard)
export class AdminBranchesController {
  constructor(private readonly branches: AdminBranchesService) {}

  @Get()
  listAll() {
    return this.branches.listAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBranchDto) {
    return this.branches.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto): Promise<void> {
    await this.branches.update(id, dto);
  }
}
