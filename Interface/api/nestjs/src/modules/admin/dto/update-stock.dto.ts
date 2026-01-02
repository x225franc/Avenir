import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, MaxLength, Min } from 'class-validator';

export class UpdateStockDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10)
  symbol?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  companyName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.01)
  currentPrice?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
