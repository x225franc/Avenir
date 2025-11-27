import { Request, Response } from "express";
import {
	SendMessage,
	GetConversations,
	GetConversation,
	AssignConversation,
	TransferConversation,
	CloseConversation,
	MarkConversationAsRead,
	CheckOpenConversation,
} from "@application/use-cases";
import { MessageRepository } from "@infrastructure/database/mysql/MessageRepository";
import { UserRepository } from "@infrastructure/database/mysql/UserRepository";
import { getMessageSocketService } from "@infrastructure/services/MessageSocketService";

/**
 * Controller pour les opérations de messagerie
 */
export class MessageController {
	private sendMessageUseCase: SendMessage;
	private getConversationsUseCase: GetConversations;
	private getConversationUseCase: GetConversation;
	private assignConversationUseCase: AssignConversation;
	private transferConversationUseCase: TransferConversation;
	private closeConversationUseCase: CloseConversation;
	private markConversationAsReadUseCase: MarkConversationAsRead;
	private checkOpenConversationUseCase: CheckOpenConversation;

	constructor() {
		const messageRepository = new MessageRepository();
		const userRepository = new UserRepository();

		this.sendMessageUseCase = new SendMessage(messageRepository, userRepository);
		this.getConversationsUseCase = new GetConversations(messageRepository);
		this.getConversationUseCase = new GetConversation(messageRepository);
		this.assignConversationUseCase = new AssignConversation(messageRepository, userRepository);
		this.transferConversationUseCase = new TransferConversation(messageRepository, userRepository);
		this.closeConversationUseCase = new CloseConversation(messageRepository);
		this.markConversationAsReadUseCase = new MarkConversationAsRead(messageRepository);
		this.checkOpenConversationUseCase = new CheckOpenConversation(messageRepository);
	}

	/**
	 * POST /api/messages/send
	 * Envoyer un nouveau message
	 */
	async sendMessage(req: Request, res: Response): Promise<void> {
		try {
			const { conversationId, fromUserId, toUserId, content } = req.body;

			if (!conversationId || !fromUserId || !content) {
				res.status(400).json({
					success: false,
					error: "conversationId, fromUserId et content sont requis",
				});
				return;
			}

			const message = await this.sendMessageUseCase.execute({
				conversationId,
				fromUserId,
				toUserId,
				content,
			});

			const messageData = {
				id: message.getId()?.getValue(),
				conversationId: message.getConversationId(),
				fromUserId: message.getFromUserId()?.value || null,
				toUserId: message.getToUserId()?.value || null,
				content: message.getContent(),
				isSystem: message.getIsSystem(),
				isRead: message.getIsRead(),
				createdAt: message.getCreatedAt(),
			};

			// Émettre le message via WebSocket
			try {
				const socketService = getMessageSocketService();
				socketService.emitNewMessage(conversationId, messageData);
			} catch (socketError) {
				console.error("Error emitting message via WebSocket:", socketError);
			}

			res.status(201).json({
				success: true,
				message: "Message envoyé",
				data: messageData,
			});
		} catch (error: any) {
			console.error("Error in sendMessage:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors de l'envoi du message",
			});
		}
	}

	/**
	 * GET /api/messages/conversations
	 * Récupérer les conversations d'un utilisateur
	 */
	async getConversations(req: Request, res: Response): Promise<void> {
		try {
			const userId = parseInt(req.query.userId as string);
			const role = req.query.role as "client" | "advisor";

			if (!userId || !role) {
				res.status(400).json({
					success: false,
					error: "userId et role sont requis",
				});
				return;
			}

			const conversations = await this.getConversationsUseCase.execute({ userId, role });

			const formattedConversations = conversations.map(conv => ({
				id: conv.getId(),
				clientId: conv.getClientId().value,
				advisorId: conv.getAdvisorId()?.value || null,
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
			}));

			res.status(200).json({
				success: true,
				data: formattedConversations,
			});
		} catch (error: any) {
			console.error("Error in getConversations:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors de la récupération des conversations",
			});
		}
	}

	/**
	 * GET /api/messages/conversation/:conversationId
	 * Récupérer une conversation spécifique
	 */
	async getConversation(req: Request, res: Response): Promise<void> {
		try {
			const { conversationId } = req.params;

			const conversation = await this.getConversationUseCase.execute({ conversationId });

			if (!conversation) {
				res.status(404).json({
					success: false,
					error: "Conversation non trouvée",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: {
					id: conversation.getId(),
					clientId: conversation.getClientId().value,
					advisorId: conversation.getAdvisorId()?.value || null,
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
			});
		} catch (error: any) {
			console.error("Error in getConversation:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors de la récupération de la conversation",
			});
		}
	}

	/**
	 * POST /api/messages/assign
	 * Assigner une conversation à un conseiller
	 */
	async assignConversation(req: Request, res: Response): Promise<void> {
		try {
			const { conversationId, advisorId } = req.body;

			if (!conversationId || !advisorId) {
				res.status(400).json({
					success: false,
					error: "conversationId et advisorId sont requis",
				});
				return;
			}

			// Get conversation info before assigning
			const conversation = await this.getConversationUseCase.execute({ conversationId });
			if (!conversation) {
				res.status(404).json({
					success: false,
					error: "Conversation non trouvée",
				});
				return;
			}

			await this.assignConversationUseCase.execute({ conversationId, advisorId });

			// Émettre l'assignation via WebSocket
			try {
				const socketService = getMessageSocketService();
				socketService.emitConversationAssigned(
					conversationId,
					advisorId,
					parseInt(conversation.getClientId().value)
				);
			} catch (socketError) {
				console.error("Error emitting assignment via WebSocket:", socketError);
			}

			res.status(200).json({
				success: true,
				message: "Conversation assignée avec succès",
			});
		} catch (error: any) {
			console.error("Error in assignConversation:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors de l'assignation de la conversation",
			});
		}
	}

	/**
	 * POST /api/messages/transfer
	 * Transférer une conversation à un autre conseiller
	 */
	async transferConversation(req: Request, res: Response): Promise<void> {
		try {
			const { conversationId, newAdvisorId, currentAdvisorId } = req.body;

			if (!conversationId || !newAdvisorId || !currentAdvisorId) {
				res.status(400).json({
					success: false,
					error: "conversationId, newAdvisorId et currentAdvisorId sont requis",
				});
				return;
			}

			// Get conversation info before transferring
			const conversation = await this.getConversationUseCase.execute({ conversationId });
			if (!conversation) {
				res.status(404).json({
					success: false,
					error: "Conversation non trouvée",
				});
				return;
			}

			await this.transferConversationUseCase.execute({
				conversationId,
				newAdvisorId,
				currentAdvisorId,
			});

			// Émettre le transfert via WebSocket
			try {
				const socketService = getMessageSocketService();
				socketService.emitConversationTransferred(
					conversationId,
					newAdvisorId,
					currentAdvisorId,
					parseInt(conversation.getClientId().value)
				);
			} catch (socketError) {
				console.error("Error emitting transfer via WebSocket:", socketError);
			}

			res.status(200).json({
				success: true,
				message: "Conversation transférée avec succès",
			});
		} catch (error: any) {
			console.error("Error in transferConversation:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors du transfert de la conversation",
			});
		}
	}

	/**
	 * POST /api/messages/close
	 * Clôturer une conversation
	 */
	async closeConversation(req: Request, res: Response): Promise<void> {
		try {
			const { conversationId, advisorId } = req.body;

			if (!conversationId || !advisorId) {
				res.status(400).json({
					success: false,
					error: "conversationId et advisorId sont requis",
				});
				return;
			}

			// Get conversation info before closing
			const conversation = await this.getConversationUseCase.execute({ conversationId });
			if (!conversation) {
				res.status(404).json({
					success: false,
					error: "Conversation non trouvée",
				});
				return;
			}

			await this.closeConversationUseCase.execute({ conversationId, advisorId });

			// Émettre la clôture via WebSocket
			try {
				const socketService = getMessageSocketService();
				socketService.emitConversationClosed(
					conversationId,
					parseInt(conversation.getClientId().value),
					advisorId
				);
			} catch (socketError) {
				console.error("Error emitting close via WebSocket:", socketError);
			}

			res.status(200).json({
				success: true,
				message: "Conversation clôturée avec succès",
			});
		} catch (error: any) {
			console.error("Error in closeConversation:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors de la clôture de la conversation",
			});
		}
	}

	/**
	 * POST /api/messages/mark-read
	 * Marquer une conversation comme lue
	 */
	async markAsRead(req: Request, res: Response): Promise<void> {
		try {
			const { conversationId, userId } = req.body;

			if (!conversationId || !userId) {
				res.status(400).json({
					success: false,
					error: "conversationId et userId sont requis",
				});
				return;
			}

			await this.markConversationAsReadUseCase.execute({ conversationId, userId });

			res.status(200).json({
				success: true,
				message: "Conversation marquée comme lue",
			});
		} catch (error: any) {
			console.error("Error in markAsRead:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors du marquage de la conversation",
			});
		}
	}

	/**
	 * GET /api/messages/check-open/:clientId
	 * Vérifier si un client a une conversation ouverte
	 */
	async checkOpenConversation(req: Request, res: Response): Promise<void> {
		try {
			const clientId = parseInt(req.params.clientId);

			if (!clientId) {
				res.status(400).json({
					success: false,
					error: "clientId est requis",
				});
				return;
			}

			const hasOpen = await this.checkOpenConversationUseCase.execute({ clientId });

			res.status(200).json({
				success: true,
				data: { hasOpenConversation: hasOpen },
			});
		} catch (error: any) {
			console.error("Error in checkOpenConversation:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur lors de la vérification",
			});
		}
	}
}
