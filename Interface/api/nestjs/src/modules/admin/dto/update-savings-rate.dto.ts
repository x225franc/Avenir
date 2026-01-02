import { IsNumber, Min, Max } from 'class-validator';

export class UpdateSavingsRateDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;
}
