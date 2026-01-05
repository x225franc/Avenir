import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class IbanTransferDto {
  @IsString()
  @IsNotEmpty({ message: 'IBAN externe requis' })
  externalIban: string;

  @IsString()
  @IsNotEmpty({ message: 'ID du compte source requis' })
  fromAccountId: string;

  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  @IsNotEmpty({ message: 'Montant requis' })
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
