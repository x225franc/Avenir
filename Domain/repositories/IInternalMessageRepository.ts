import { InternalMessage } from "../entities/InternalMessage";
import { InternalMessageId } from "../value-objects/InternalMessageId";
import { UserId } from "../value-objects/UserId";

/**
 * Interface du repository pour les messages internes
 */
export interface IInternalMessageRepository {
	/**
	 * Crée un nouveau message interne
	 */
	create(message: InternalMessage): Promise<InternalMessage>;

	/**
	 * Trouve un message par son ID
	 */
	findById(id: InternalMessageId): Promise<InternalMessage | null>;

	/**
	 * Trouve tous les messages de groupe
	 */
	findGroupMessages(): Promise<InternalMessage[]>;

	/**
	 * Trouve les messages directs entre deux utilisateurs
	 */
	findDirectMessages(userId1: UserId, userId2: UserId): Promise<InternalMessage[]>;

	/**
	 * Trouve tous les messages concernant un utilisateur (groupe + directs)
	 */
	findByUserId(userId: UserId): Promise<InternalMessage[]>;

	/**
	 * Marque un message comme lu
	 */
	markAsRead(messageId: InternalMessageId): Promise<void>;
}
