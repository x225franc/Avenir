import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { AccountType } from '@domain/entities/Account';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'Nom du compte requis' })
  accountName: string;

  @IsEnum(AccountType, { message: 'Type de compte invalide' })
  @IsNotEmpty({ message: 'Type de compte requis' })
  accountType: AccountType;
}
