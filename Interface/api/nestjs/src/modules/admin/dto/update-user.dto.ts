import { IsEmail, IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @IsEnum(['client', 'advisor', 'director'])
  @IsOptional()
  role?: 'client' | 'advisor' | 'director';
}
