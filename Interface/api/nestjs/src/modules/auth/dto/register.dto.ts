import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @IsNotEmpty({ message: 'Mot de passe requis' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Prénom requis' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Nom requis' })
  lastName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @IsIn(['client', 'advisor', 'director'], { message: 'Le rôle doit être client, advisor ou director' })
  role?: 'client' | 'advisor' | 'director';
}
