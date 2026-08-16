import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderLineDto {
  /** MenuItem.legacyId — the numeric id the app carries in its cart. */
  @IsOptional()
  @IsInt()
  menuItemId?: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1, { message: 'Invalid item quantity.' })
  qty!: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  sugar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  ice?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  branchSlug!: string;

  @IsIn(['delivery', 'pickup'])
  orderType!: 'delivery' | 'pickup';

  @IsIn(['tng', 'card', 'banking'])
  payMethod!: 'tng' | 'card' | 'banking';

  @IsArray()
  @ArrayMinSize(1, { message: 'Cart is empty.' })
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  items!: OrderLineDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsToRedeem?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  orderNote?: string;
}
