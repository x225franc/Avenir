import { Message } from "../entities/Message";
import { Conversation } from "../entities/Conversation";
import { UserId } from "../value-objects/UserId";

/**
 * Interface du repository pour les messages et conversations
 */
export interface IMessageRepository {
	/**
	 * Sauvegarde un message
	 */
	save(message: Message): Promise<Message>;

	/**
	 * Trouve un message par son ID
	 */
	findById(id: number): Promise<Message | null>;

	/**
	 * Trouve tous les messages d'une conversation
	 */
	findByConversationId(conversationId: string): Promise<Message[]>;

	/**
	 * Marque un message comme lu
	 */
	markAsRead(messageId: number): Promise<void>;

	/**
	 * Trouve une conversation par son ID
	 */
	getConversationById(conversationId: string): Promise<Conversation | null>;

	/**
	 * Récupère toutes les conversations d'un client
	 */
	getClientConversations(clientId: UserId): Promise<Conversation[]>;

	/**
	 * Récupère toutes les conversations d'un conseiller
	 */
	getAdvisorConversations(advisorId: UserId): Promise<Conversation[]>;

	/**
	 * Récupère toutes les conversations non assignées
	 */
	getUnassignedConversations(): Promise<Conversation[]>;

	/**
	 * Récupère toutes les conversations
	 */
	getAllConversations(): Promise<Conversation[]>;

	/**
	 * Assigne une conversation à un conseiller
	 */
	assignConversation(conversationId: string, advisorId: UserId): Promise<void>;

	/**
	 * Transfère une conversation à un autre conseiller
	 */
	transferConversation(conversationId: string, newAdvisorId: UserId): Promise<void>;

	/**
	 * Ferme une conversation
	 */
	closeConversation(conversationId: string): Promise<void>;

	/**
	 * Récupère le nombre de messages non lus dans une conversation
	 */
	getUnreadCount(conversationId: string, userId: UserId): Promise<number>;

	/**
	 * Marque tous les messages d'une conversation comme lus
	 */
	markConversationAsRead(conversationId: string, userId: UserId): Promise<void>;

	/**
	 * Vérifie si un client a une conversation ouverte
	 */
	hasOpenConversation(clientId: UserId): Promise<boolean>;
}
