import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class TransferConversationDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsInt()
  @IsNotEmpty()
  newAdvisorId: number;
}
