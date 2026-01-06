import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class SendInternalMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Le message ne peut pas être vide' })
  content: string;

  @IsBoolean()
  @IsOptional()
  isGroupMessage?: boolean;

  @IsString()
  @IsOptional()
  recipientId?: string;
}
