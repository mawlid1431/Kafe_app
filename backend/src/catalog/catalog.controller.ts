import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ValidatePromoDto } from './dto/validate-promo.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('branches')
  listBranches() {
    return this.catalog.listBranches();
  }

  @Get('menu')
  listMenu(@Query('category') category?: string) {
    return this.catalog.listMenu(category);
  }

  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Get('promos')
  listPromos() {
    return this.catalog.listPromos();
  }

  /** POST because it takes a cart subtotal in the body; it mutates nothing. */
  @Post('promos/validate')
  @HttpCode(HttpStatus.OK)
  validatePromo(@Body() dto: ValidatePromoDto) {
    return this.catalog.validatePromo(dto.code, dto.subtotal);
  }
}
