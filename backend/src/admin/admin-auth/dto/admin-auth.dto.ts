import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username and password are required.' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Username and password are required.' })
  password!: string;
}

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required.' })
  username!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsEmail({}, { message: 'A valid email is required.' })
  email!: string;

  @IsIn(['superadmin', 'staff'])
  role!: 'superadmin' | 'staff';
}

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'A valid email is required.' })
  email?: string;

  @IsOptional()
  @IsIn(['superadmin', 'staff'])
  role?: 'superadmin' | 'staff';

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password?: string;
}
