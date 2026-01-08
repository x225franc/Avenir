import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CloseConversationDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsInt()
  @IsOptional()
  advisorId?: number;
}
