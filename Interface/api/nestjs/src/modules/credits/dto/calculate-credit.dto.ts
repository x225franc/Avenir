import { IsInt, IsNumber, Min, Max } from 'class-validator';

export class CalculateCreditDto {
  @IsNumber()
  @Min(0.01)
  principalAmount: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  annualInterestRate: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  insuranceRate: number;

  @IsInt()
  @Min(1)
  durationMonths: number;
}
