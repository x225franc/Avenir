import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsInt()
  fromUserId?: number;

  @IsOptional()
  @IsInt()
  toUserId?: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
