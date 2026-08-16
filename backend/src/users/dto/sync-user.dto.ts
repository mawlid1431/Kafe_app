import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class SyncUserDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEmail({}, { message: 'A valid email is required.' })
  email!: string;

  @IsOptional()
  @IsUrl({}, { message: 'pictureUrl must be a valid URL.' })
  pictureUrl?: string;
}
