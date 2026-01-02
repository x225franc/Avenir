import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateNewsDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10000)
  content?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
