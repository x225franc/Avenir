import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class MarkReadDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsOptional()
  @IsInt()
  userId?: number;
}
