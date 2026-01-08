import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class IbanTransferDto {
  @IsString()
  @IsNotEmpty({ message: 'Compte source requis' })
  sourceAccountId: string;

  @IsString()
  @IsNotEmpty({ message: 'IBAN destination requis' })
  destinationIban: string;

  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  @IsNotEmpty({ message: 'Montant requis' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Devise requise' })
  currency: string;

  @IsString()
  @IsOptional()
  description?: string;
}
