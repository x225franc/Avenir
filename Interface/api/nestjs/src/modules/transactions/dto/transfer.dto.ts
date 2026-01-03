import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty({ message: 'IBAN source requis' })
  fromIban: string;

  @IsString()
  @IsNotEmpty({ message: 'IBAN destination requis' })
  toIban: string;

  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  @IsNotEmpty({ message: 'Montant requis' })
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
