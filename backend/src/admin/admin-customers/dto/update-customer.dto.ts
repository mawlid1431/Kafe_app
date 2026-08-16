import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsBoolean()
  suspended?: boolean;

  /** Empty string clears the customer's home branch. */
  @IsOptional()
  @IsString()
  branchSlug?: string;
}
