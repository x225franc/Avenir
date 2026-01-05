import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class DepositDto {
  @IsString()
  @IsNotEmpty({ message: 'ID du compte requis' })
  accountId: string;

  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  amount: number;
}
