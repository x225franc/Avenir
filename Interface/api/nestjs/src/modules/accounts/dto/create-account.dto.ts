import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { AccountType } from '@domain/entities/Account';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'Nom du compte requis' })
  accountName: string;

  @IsEnum(AccountType, { message: 'Type de compte invalide' })
  @IsNotEmpty({ message: 'Type de compte requis' })
  accountType: AccountType;

  @IsOptional()
  @IsNumber({}, { message: 'Le dépôt initial doit être un nombre' })
  @Min(0, { message: 'Le dépôt initial ne peut pas être négatif' })
  initialDeposit?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
