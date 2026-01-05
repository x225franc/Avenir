import { IsNotEmpty, IsString } from 'class-validator';

export class SendInternalMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'ID du destinataire requis' })
  recipientId: string;

  @IsString()
  @IsNotEmpty({ message: 'Le message ne peut pas être vide' })
  content: string;
}
