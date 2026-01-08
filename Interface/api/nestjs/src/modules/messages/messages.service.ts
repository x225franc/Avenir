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

      // Utiliser fromUserId du DTO s'il est fourni, sinon userId du token JWT
      const fromUserId = sendMessageDto.fromUserId || parseInt(userId);

      const message = await sendMessageUseCase.execute({
        conversationId,
        fromUserId: fromUserId,
        toUserId: sendMessageDto.toUserId,
        content: sendMessageDto.content,
        isSystem: false,
      });

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Message envoyé',
        data: {
          id: message.getId()?.getValue(),
          conversationId: message.getConversationId(),
          fromUserId: message.getFromUserId()?.value || null,
          toUserId: message.getToUserId()?.value || null,
          content: message.getContent(),
          isSystem: message.getIsSystem(),
          isRead: message.getIsRead(),
          createdAt: message.getCreatedAt(),
        },
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

      // Enrichir avec les données utilisateur
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const clientId = conv.getClientId().value;
          const advisorId = conv.getAdvisorId()?.value || null;

          // Charger les infos du client
          let clientUser = null;
          if (clientId) {
            const client = await this.userRepository.findById(UserId.fromString(clientId.toString()));
            if (client) {
              clientUser = {
                id: client.id.value,
                firstName: client.firstName,
                lastName: client.lastName,
                email: client.email.value,
              };
            }
          }

          // Charger les infos de l'advisor si assigné
          let advisorUser = null;
          if (advisorId) {
            const advisor = await this.userRepository.findById(UserId.fromString(advisorId.toString()));
            if (advisor) {
              advisorUser = {
                id: advisor.id.value,
                firstName: advisor.firstName,
                lastName: advisor.lastName,
                email: advisor.email.value,
              };
            }
          }

          return {
            id: conv.getId(),
            clientId: conv.getClientId().value,
            advisorId: advisorId,
            clientUser,
            advisorUser,
            isClosed: conv.getIsClosed(),
            isAssigned: conv.isAssigned(),
            unreadCount: conv.getUnreadCount(),
            lastMessageAt: conv.getLastMessageAt(),
            createdAt: conv.getCreatedAt(),
            messages: conv.getMessages().map(msg => ({
              id: msg.getId()?.getValue(),
              fromUserId: msg.getFromUserId()?.value || null,
              toUserId: msg.getToUserId()?.value || null,
              content: msg.getContent(),
              isRead: msg.getIsRead(),
              isSystem: msg.getIsSystem(),
              createdAt: msg.getCreatedAt(),
            })),
          };
        })
      );

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: enrichedConversations,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des conversations');
    }
  }

  async getConversationMessages(conversationId: string, userId: string) {
    try {
      // Utiliser le Use Case GetConversation
      const getConversationUseCase = new GetConversation(this.messageRepository);
      const conversation = await getConversationUseCase.execute({ conversationId });

      if (!conversation) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Enrichir avec les données utilisateur
      const clientId = conversation.getClientId().value;
      const advisorId = conversation.getAdvisorId()?.value || null;

      let clientUser = null;
      if (clientId) {
        const client = await this.userRepository.findById(UserId.fromString(clientId.toString()));
        if (client) {
          clientUser = {
            id: client.id.value,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email.value,
          };
        }
      }

      let advisorUser = null;
      if (advisorId) {
        const advisor = await this.userRepository.findById(UserId.fromString(advisorId.toString()));
        if (advisor) {
          advisorUser = {
            id: advisor.id.value,
            firstName: advisor.firstName,
            lastName: advisor.lastName,
            email: advisor.email.value,
          };
        }
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: {
          id: conversation.getId(),
          clientId: conversation.getClientId().value,
          advisorId: conversation.getAdvisorId()?.value || null,
          clientUser,
          advisorUser,
          isClosed: conversation.getIsClosed(),
          isAssigned: conversation.isAssigned(),
          unreadCount: conversation.getUnreadCount(),
          lastMessageAt: conversation.getLastMessageAt(),
          createdAt: conversation.getCreatedAt(),
          messages: conversation.getMessages().map(msg => ({
            id: msg.getId()?.getValue(),
            fromUserId: msg.getFromUserId()?.value || null,
            toUserId: msg.getToUserId()?.value || null,
            content: msg.getContent(),
            isRead: msg.getIsRead(),
            isSystem: msg.getIsSystem(),
            createdAt: msg.getCreatedAt(),
          })),
        },
      };
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Conversation assignée avec succès',
      };
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Conversation transférée avec succès',
      };
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Conversation clôturée avec succès',
      };
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

      // Utiliser userId du DTO s'il est fourni, sinon userId du token JWT
      const userIdToUse = markReadDto.userId || parseInt(userId);

      await markAsReadUseCase.execute({
        conversationId: markReadDto.conversationId,
        userId: userIdToUse,
      });

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Conversation marquée comme lue',
      };
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: { hasOpenConversation },
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la vérification de conversation ouverte');
    }
  }
}
