import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class AssignConversationDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsInt()
  @IsNotEmpty()
  advisorId: number;
}
