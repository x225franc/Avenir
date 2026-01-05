import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SendInternalMessageDto } from './dto/send-internal-message.dto';
import { InternalMessageRepository } from '@infrastructure/database/postgresql/InternalMessageRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { SendInternalMessage } from '@application/use-cases/internal-message/SendInternalMessage';
import { GetInternalMessages } from '@application/use-cases/internal-message/GetInternalMessages';
import { GetStaffMembers } from '@application/use-cases/internal-message/GetStaffMembers';

@Injectable()
export class InternalMessagesService {
  constructor(
    private readonly internalMessageRepository: InternalMessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async sendMessage(senderId: string, dto: SendInternalMessageDto) {
    try {
      // Utiliser le Use Case
      const sendMessageUseCase = new SendInternalMessage(this.internalMessageRepository);

      const message = await sendMessageUseCase.execute(
        senderId,
        dto.content,
        false, // isGroupMessage = false pour message direct
        dto.recipientId
      );

      return {
        id: message.getId().value,
        senderId: message.getFromUserId().value,
        recipientId: message.getToUserId()?.value || null,
        content: message.getContent(),
        isRead: message.getIsRead(),
        createdAt: message.getCreatedAt(),
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'envoi du message');
    }
  }

  async getMessages(userId: string, otherUserId: string) {
    try {
      // Utiliser le Use Case
      const getMessagesUseCase = new GetInternalMessages(this.internalMessageRepository);

      const messages = await getMessagesUseCase.execute(userId, 'direct', otherUserId);

      return messages.map(message => ({
        id: message.getId().value,
        senderId: message.getFromUserId().value,
        recipientId: message.getToUserId()?.value || null,
        content: message.getContent(),
        isRead: message.getIsRead(),
        createdAt: message.getCreatedAt(),
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des messages');
    }
  }

  async getStaffMembers() {
    try {
      // Utiliser le Use Case
      const getStaffUseCase = new GetStaffMembers(this.userRepository);
      const staffMembers = await getStaffUseCase.execute();

      return staffMembers.map(user => ({
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des membres du staff');
    }
  }
}
