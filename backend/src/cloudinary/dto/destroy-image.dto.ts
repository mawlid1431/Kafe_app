import { IsNotEmpty, IsString } from 'class-validator';

export class DestroyImageDto {
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
