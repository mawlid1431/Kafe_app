import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class CreatePromoDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  subtitle!: string;

  @IsString()
  @IsNotEmpty({ message: 'A promo code is required.' })
  code!: string;

  @IsOptional()
  @IsUrl({}, { message: 'imageUrl must be a valid URL.' })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedOff?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minSpend?: number;

  @IsBoolean()
  active!: boolean;
}

export class UpdatePromoDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsUrl({}, { message: 'imageUrl must be a valid URL.' }) imageUrl?: string;
  @IsOptional() @IsString() imagePublicId?: string;
  @IsOptional() @IsInt() @Min(1) @Max(100) discountPercent?: number;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) fixedOff?: number;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) minSpend?: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
