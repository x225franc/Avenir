import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { TransferConversationDto } from './dto/transfer-conversation.dto';
import { CloseConversationDto } from './dto/close-conversation.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { MessageRepository } from '@infrastructure/database/postgresql/MessageRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { UserId } from '@domain/value-objects/UserId';
import { Message } from '@domain/entities/Message';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
    try {
      const fromUserId = UserId.fromString(userId);
      let toUserId: UserId | null = null;

      if (sendMessageDto.toUserId) {
        toUserId = UserId.fromNumber(sendMessageDto.toUserId);
        const toUser = await this.userRepository.findById(toUserId);
        if (!toUser) {
          throw new NotFoundException('Destinataire non trouvé');
        }
      }

      let conversationId = sendMessageDto.conversationId;
      if (!conversationId && toUserId) {
        const fromUser = await this.userRepository.findById(fromUserId);
        if (fromUser?.role === 'client') {
          conversationId = `client-${userId}-advisor-${sendMessageDto.toUserId}`;
        } else {
          conversationId = `client-${sendMessageDto.toUserId}-advisor-${userId}`;
        }
      }

      if (!conversationId) {
        throw new BadRequestException('conversationId ou toUserId requis');
      }

      const message = Message.create(conversationId, fromUserId, toUserId, sendMessageDto.content, false, false);
      await this.messageRepository.save(message);

      return {
        id: message.getId()?.getValue(),
        conversationId: message.getConversationId(),
        fromUserId: message.getFromUserId()?.value,
        toUserId: message.getToUserId()?.value,
        content: message.getContent(),
        isRead: message.getIsRead(),
        createdAt: message.getCreatedAt(),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'envoi du message');
    }
  }

  async getConversations(userId: string) {
    // Since MessageRepository doesn't have a method to get all conversations for a user,
    // we return an empty array for now. This should be implemented with a proper query.
    // TODO: Add a method to MessageRepository to efficiently fetch user conversations
    return [];
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const messages = await this.messageRepository.findByConversationId(conversationId);

    if (messages.length > 0) {
      const firstMessage = messages[0];
      const isParticipant =
        firstMessage.getFromUserId()?.value === userId ||
        firstMessage.getToUserId()?.value === userId;

      if (!isParticipant) {
        throw new ForbiddenException('Accès interdit à cette conversation');
      }
    }

    return messages.map(message => ({
      id: message.getId()?.getValue(),
      conversationId: message.getConversationId(),
      fromUserId: message.getFromUserId()?.value,
      toUserId: message.getToUserId()?.value,
      content: message.getContent(),
      isRead: message.getIsRead(),
      isSystem: message.getIsSystem(),
      createdAt: message.getCreatedAt(),
    }));
  }

  async assignConversation(assignDto: AssignConversationDto) {
    const advisor = await this.userRepository.findById(UserId.fromNumber(assignDto.advisorId));
    if (!advisor) {
      throw new NotFoundException('Conseiller non trouvé');
    }
    if (advisor.role !== 'advisor' && advisor.role !== 'director') {
      throw new BadRequestException('L\'utilisateur n\'est pas un conseiller');
    }

    const messages = await this.messageRepository.findByConversationId(assignDto.conversationId);
    for (const message of messages) {
      message.assignTo(UserId.fromNumber(assignDto.advisorId));
      await this.messageRepository.save(message);
    }

    return { message: 'Conversation assignée avec succès' };
  }

  async transferConversation(transferDto: TransferConversationDto) {
    const newAdvisor = await this.userRepository.findById(UserId.fromNumber(transferDto.newAdvisorId));
    if (!newAdvisor) {
      throw new NotFoundException('Nouveau conseiller non trouvé');
    }
    if (newAdvisor.role !== 'advisor' && newAdvisor.role !== 'director') {
      throw new BadRequestException('L\'utilisateur n\'est pas un conseiller');
    }

    const messages = await this.messageRepository.findByConversationId(transferDto.conversationId);
    for (const message of messages) {
      message.assignTo(UserId.fromNumber(transferDto.newAdvisorId));
      await this.messageRepository.save(message);
    }

    return { message: 'Conversation transférée avec succès' };
  }

  async closeConversation(closeDto: CloseConversationDto) {
    const messages = await this.messageRepository.findByConversationId(closeDto.conversationId);
    if (messages.length === 0) {
      throw new NotFoundException('Conversation non trouvée');
    }

    for (const message of messages) {
      message.closeConversation();
      await this.messageRepository.save(message);
    }

    return { message: 'Conversation fermée avec succès' };
  }

  async markAsRead(userId: string, markReadDto: MarkReadDto) {
    const messages = await this.messageRepository.findByConversationId(markReadDto.conversationId);

    for (const message of messages) {
      if (message.getToUserId()?.value === userId && !message.getIsRead()) {
        message.markAsRead();
        await this.messageRepository.save(message);
      }
    }

    return { message: 'Messages marqués comme lus' };
  }

  async checkOpenConversation(clientId: string) {
    const conversations = await this.getConversations(clientId);
    const openConversations = conversations.filter((conv: any) => !conv.isClosed);

    return {
      hasOpenConversation: openConversations.length > 0,
      conversationId: openConversations.length > 0 ? openConversations[0].conversationId : null,
    };
  }
}
