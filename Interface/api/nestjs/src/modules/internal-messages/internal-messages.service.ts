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
        dto.isGroupMessage || false,
        dto.recipientId
      );

      return {
        success: true,
        data: {
          id: message.getId().getValue(),
          fromUserId: message.getFromUserId().value,
          toUserId: message.getToUserId()?.value || null,
          content: message.getContent(),
          isGroupMessage: message.getIsGroupMessage(),
          createdAt: message.getCreatedAt(),
        },
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'envoi du message');
    }
  }

  async getMessages(userId: string, type: 'group' | 'direct', otherUserId?: string) {
    try {
      // Utiliser le Use Case
      const getMessagesUseCase = new GetInternalMessages(this.internalMessageRepository);

      const messages = await getMessagesUseCase.execute(userId, type, otherUserId);

      return {
        success: true,
        data: messages.map(message => ({
          id: message.getId().getValue(),
          fromUserId: message.getFromUserId().value,
          toUserId: message.getToUserId()?.value || null,
          content: message.getContent(),
          isGroupMessage: message.getIsGroupMessage(),
          isRead: message.getIsRead(),
          createdAt: message.getCreatedAt(),
        })),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des messages');
    }
  }

  async getStaffMembers() {
    try {
      // Utiliser le Use Case
      const getStaffUseCase = new GetStaffMembers(this.userRepository);
      const staffMembers = await getStaffUseCase.execute();

      return {
        success: true,
        data: staffMembers.map(user => ({
          id: user.id.value,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email.value,
          role: user.role,
        })),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des membres du staff');
    }
  }
}
