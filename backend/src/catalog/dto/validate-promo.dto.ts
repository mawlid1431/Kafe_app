import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ValidatePromoDto {
  @IsString()
  @IsNotEmpty({ message: 'Promo code is required.' })
  code!: string;

  @IsNumber()
  @Min(0)
  subtotal!: number;
}
