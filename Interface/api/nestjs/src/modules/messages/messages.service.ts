import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { TransferConversationDto } from './dto/transfer-conversation.dto';
import { CloseConversationDto } from './dto/close-conversation.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { MessageRepository } from '@infrastructure/database/postgresql/MessageRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { UserId } from '@domain/value-objects/UserId';
import { SendMessage } from '@application/use-cases/message/SendMessage';
import { GetConversations } from '@application/use-cases/message/GetConversations';
import { GetConversation } from '@application/use-cases/message/GetConversation';
import { AssignConversation } from '@application/use-cases/message/AssignConversation';
import { TransferConversation } from '@application/use-cases/message/TransferConversation';
import { CloseConversation } from '@application/use-cases/message/CloseConversation';
import { MarkConversationAsRead } from '@application/use-cases/message/MarkConversationAsRead';
import { CheckOpenConversation } from '@application/use-cases/message/CheckOpenConversation';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
    try {
      // Utiliser le Use Case SendMessage
      const sendMessageUseCase = new SendMessage(
        this.messageRepository,
        this.userRepository
      );

      // Déterminer le conversationId si pas fourni
      let conversationId = sendMessageDto.conversationId;
      if (!conversationId && sendMessageDto.toUserId) {
        const fromUser = await this.userRepository.findById(UserId.fromString(userId));
        if (fromUser?.role === 'client') {
          conversationId = `client-${userId}-advisor-${sendMessageDto.toUserId}`;
        } else {
          conversationId = `client-${sendMessageDto.toUserId}-advisor-${userId}`;
        }
      }

      if (!conversationId) {
        throw new BadRequestException('conversationId ou toUserId requis');
      }

      const message = await sendMessageUseCase.execute({
        conversationId,
        fromUserId: parseInt(userId),
        toUserId: sendMessageDto.toUserId,
        content: sendMessageDto.content,
        isSystem: false,
      });

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

  async getConversations(userId: string, userRole: 'client' | 'advisor') {
    try {
      // Utiliser le Use Case GetConversations
      const getConversationsUseCase = new GetConversations(this.messageRepository);

      const conversations = await getConversationsUseCase.execute({
        userId: parseInt(userId),
        role: userRole,
      });

      return conversations.map(conv => ({
        conversationId: conv.getId(),
        clientId: conv.getClientId()?.value,
        advisorId: conv.getAdvisorId()?.value,
        isClosed: conv.getIsClosed(),
        lastMessageAt: conv.getLastMessageAt(),
        unreadCount: conv.getUnreadCount(),
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des conversations');
    }
  }

  async getConversationMessages(conversationId: string, userId: string) {
    try {
      // Utiliser le Use Case GetConversation pour vérifier les permissions
      const getConversationUseCase = new GetConversation(this.messageRepository);
      const conversation = await getConversationUseCase.execute({ conversationId });

      if (!conversation) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Vérifier les permissions
      const clientId = conversation.getClientId()?.value;
      const advisorId = conversation.getAdvisorId()?.value;
      const isParticipant = clientId === userId || advisorId === userId;

      if (!isParticipant) {
        throw new ForbiddenException('Accès interdit à cette conversation');
      }

      // Récupérer les messages (lecture simple)
      const messages = await this.messageRepository.findByConversationId(conversationId);

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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des messages');
    }
  }

  async assignConversation(assignDto: AssignConversationDto) {
    try {
      // Utiliser le Use Case AssignConversation
      const assignConversationUseCase = new AssignConversation(
        this.messageRepository,
        this.userRepository
      );

      await assignConversationUseCase.execute({
        conversationId: assignDto.conversationId,
        advisorId: assignDto.advisorId,
      });

      return { message: 'Conversation assignée avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'assignation de la conversation');
    }
  }

  async transferConversation(transferDto: TransferConversationDto) {
    try {
      // Utiliser le Use Case TransferConversation
      const transferConversationUseCase = new TransferConversation(
        this.messageRepository,
        this.userRepository
      );

      await transferConversationUseCase.execute({
        conversationId: transferDto.conversationId,
        newAdvisorId: transferDto.newAdvisorId,
        currentAdvisorId: transferDto.currentAdvisorId,
      });

      return { message: 'Conversation transférée avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors du transfert de la conversation');
    }
  }

  async closeConversation(closeDto: CloseConversationDto) {
    try {
      // Utiliser le Use Case CloseConversation
      const closeConversationUseCase = new CloseConversation(this.messageRepository);

      await closeConversationUseCase.execute({
        conversationId: closeDto.conversationId,
        advisorId: closeDto.advisorId || 0,
      });

      return { message: 'Conversation fermée avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la fermeture de la conversation');
    }
  }

  async markAsRead(userId: string, markReadDto: MarkReadDto) {
    try {
      // Utiliser le Use Case MarkConversationAsRead
      const markAsReadUseCase = new MarkConversationAsRead(this.messageRepository);

      await markAsReadUseCase.execute({
        conversationId: markReadDto.conversationId,
        userId: parseInt(userId),
      });

      return { message: 'Messages marqués comme lus' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors du marquage des messages comme lus');
    }
  }

  async checkOpenConversation(clientId: string) {
    try {
      // Utiliser le Use Case CheckOpenConversation
      const checkOpenConversationUseCase = new CheckOpenConversation(this.messageRepository);

      const hasOpenConversation = await checkOpenConversationUseCase.execute({
        clientId: parseInt(clientId),
      });

      return {
        hasOpenConversation,
        conversationId: hasOpenConversation ? `client-${clientId}` : null,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la vérification de conversation ouverte');
    }
  }
}
