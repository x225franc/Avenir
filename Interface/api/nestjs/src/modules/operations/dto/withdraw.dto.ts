import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class WithdrawDto {
  @IsString()
  @IsNotEmpty({ message: 'ID du compte requis' })
  accountId: string;

  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
