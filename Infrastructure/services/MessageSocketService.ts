import { Server as SocketIOServer, Socket } from "socket.io";

export class MessageSocketService {
	private io: SocketIOServer;

	constructor(io: SocketIOServer) {
		this.io = io;
	}

	/**
	 * Émettre un nouveau message dans une conversation
	 */
	emitNewMessage(conversationId: string, message: any): void {
		this.io.to(`conversation:${conversationId}`).emit("message:new", {
			conversationId,
			message,
		});
	}

	/**
	 * Émettre une notification de nouvelle conversation à tous les conseillers
	 */
	emitNewConversation(conversation: any): void {
		this.io.to("advisors").emit("conversation:new", conversation);
	}

	/**
	 * Émettre une notification d'assignation de conversation
	 */
	emitConversationAssigned(conversationId: string, advisorId: number, clientId: number): void {
		// Notifier le client
		this.io.to(`user:${clientId}`).emit("conversation:assigned", {
			conversationId,
			advisorId,
		});

		// Notifier tous les conseillers pour qu'ils mettent à jour leur liste
		this.io.to("advisors").emit("conversation:updated", {
			conversationId,
			advisorId,
		});
	}

	/**
	 * Émettre une notification de transfert de conversation
	 */
	emitConversationTransferred(conversationId: string, newAdvisorId: number, oldAdvisorId: number, clientId: number): void {
		// Notifier le client
		this.io.to(`user:${clientId}`).emit("conversation:transferred", {
			conversationId,
			newAdvisorId,
		});

		// Notifier l'ancien conseiller
		this.io.to(`user:${oldAdvisorId}`).emit("conversation:transferred:from", {
			conversationId,
			newAdvisorId,
		});

		// Notifier le nouveau conseiller
		this.io.to(`user:${newAdvisorId}`).emit("conversation:transferred:to", {
			conversationId,
			oldAdvisorId,
		});

		// Notifier tous les conseillers pour mise à jour
		this.io.to("advisors").emit("conversation:updated", {
			conversationId,
			advisorId: newAdvisorId,
		});
	}

	/**
	 * Émettre une notification de clôture de conversation
	 */
	emitConversationClosed(conversationId: string, clientId: number, advisorId: number): void {
		// Notifier le client
		this.io.to(`user:${clientId}`).emit("conversation:closed", {
			conversationId,
		});

		// Notifier le conseiller
		this.io.to(`user:${advisorId}`).emit("conversation:closed", {
			conversationId,
		});

		// Notifier tous les conseillers pour mise à jour
		this.io.to("advisors").emit("conversation:updated", {
			conversationId,
			isClosed: true,
		});
	}

	/**
	 * Émettre une notification de message lu
	 */
	emitMessageRead(conversationId: string, userId: number): void {
		this.io.to(`conversation:${conversationId}`).emit("message:read", {
			conversationId,
			userId,
		});
	}

	/**
	 * Émettre le statut "en train d'écrire"
	 */
	emitTypingStatus(conversationId: string, userId: number, isTyping: boolean): void {
		if (isTyping) {
			this.io.to(`conversation:${conversationId}`).emit("typing:start", {
				conversationId,
				userId,
			});
		} else {
			this.io.to(`conversation:${conversationId}`).emit("typing:stop", {
				conversationId,
				userId,
			});
		}
	}

	/**
	 * Émettre le nombre de messages non lus
	 */
	emitUnreadCount(userId: number, count: number): void {
		this.io.to(`user:${userId}`).emit("unread:count", {
			count,
		});
	}

	/**
	 * Émettre un nouveau message interne (groupe ou direct)
	 */
	emitInternalMessage(message: any): void {
		const payload = {
			id: message.id,
			fromUserId: message.fromUserId,
			toUserId: message.toUserId || null,
			content: message.content,
			isGroupMessage: message.isGroupMessage,
			isRead: message.isRead !== undefined ? message.isRead : false,
			createdAt: message.createdAt,
		};

		if (message.isGroupMessage) {
			// Message de groupe : notifier tous les conseillers et directeurs
			this.io.to("staff").emit("internal_message:new", payload);
		} else if (message.toUserId) {
			// Message direct : notifier uniquement le destinataire et l'expéditeur
			this.io.to(`user:${message.toUserId}`).emit("internal_message:new", payload);
			this.io.to(`user:${message.fromUserId}`).emit("internal_message:new", payload);
		}
	}

	/**
	 * Émettre le statut "en train d'écrire" pour les messages internes
	 */
	emitInternalTypingStatus(userId: number, targetUserId: number | null, isTyping: boolean): void {
		const event = isTyping ? "internal_typing:start" : "internal_typing:stop";
		
		if (targetUserId) {
			// Message direct
			this.io.to(`user:${targetUserId}`).emit(event, { userId });
		} else {
			// Message de groupe
			this.io.to("staff").emit(event, { userId });
		}
	}
}

// Instance globale qui sera initialisée dans server.ts
let messageSocketService: MessageSocketService | null = null;

export function initMessageSocketService(io: SocketIOServer): void {
	messageSocketService = new MessageSocketService(io);
	console.log("✅ MessageSocketService initialized");
}

export function getMessageSocketService(): MessageSocketService {
	if (!messageSocketService) {
		throw new Error("MessageSocketService not initialized. Call initMessageSocketService first.");
	}
	return messageSocketService;
}
