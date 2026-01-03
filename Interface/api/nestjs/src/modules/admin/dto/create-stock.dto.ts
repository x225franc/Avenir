import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, MaxLength, Min } from 'class-validator';

export class CreateStockDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  symbol: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  companyName: string;

  @IsNumber()
  @Min(0.01)
  currentPrice: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
