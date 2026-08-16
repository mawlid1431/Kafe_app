import { IsBoolean, IsInt, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  address!: string;

  @IsString()
  hours!: string;

  @IsOptional()
  @IsUrl({}, { message: 'imageUrl must be a valid URL.' })
  imageUrl?: string;

  /** Cloudinary public_id, returned by POST /api/admin/uploads/image. */
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;

  @IsBoolean()
  active!: boolean;
}

export class UpdateBranchDto {
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() hours?: string;
  @IsOptional() @IsUrl({}, { message: 'imageUrl must be a valid URL.' }) imageUrl?: string;
  @IsOptional() @IsString() imagePublicId?: string;
  @IsOptional() @IsLatitude() lat?: number;
  @IsOptional() @IsLongitude() lng?: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
