import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['active', 'delivered', 'cancelled'])
  status!: 'active' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsInt()
  @Min(0)
  trackingStep?: number;
}

export class SetTrackingStepDto {
  @IsInt()
  @Min(0)
  trackingStep!: number;
}
