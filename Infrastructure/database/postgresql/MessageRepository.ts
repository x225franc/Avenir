import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { Message } from "@domain/entities/Message";
import { Conversation } from "@domain/entities/Conversation";
import { UserId } from "@domain/value-objects/UserId";
import { pool } from "./connection";

interface MessageRow {
	id: number;
	conversation_id: string;
	from_user_id: number | null;
	to_user_id: number | null;
	content: string;
	is_read: boolean;
	is_closed: boolean;
	is_system: boolean;
	created_at: Date;
}

interface ConversationInfo {
	conversation_id: string;
	client_id: number;
	advisor_id: number | null;
	is_closed: boolean;
	last_message_at: Date;
	created_at: Date;
}

export class MessageRepository implements IMessageRepository {
	async save(message: Message): Promise<Message> {
		const result = await pool.query(
			`INSERT INTO messages 
			(conversation_id, from_user_id, to_user_id, content, is_read, is_closed, is_system, created_at) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING id`,
			[
				message.getConversationId(),
				message.getFromUserId()?.value || null,
				message.getToUserId()?.value || null,
				message.getContent(),
				message.getIsRead(),
				message.getIsClosed(),
				message.getIsSystem(),
				message.getCreatedAt(),
			]
		);

		return Message.fromPersistence(
			result.rows[0].id,
			message.getConversationId(),
			message.getFromUserId() ? parseInt(message.getFromUserId()!.value) : null,
			message.getToUserId() ? parseInt(message.getToUserId()!.value) : null,
			message.getContent(),
			message.getIsRead(),
			message.getIsClosed(),
			message.getIsSystem(),
			message.getCreatedAt()
		);
	}

	async findById(id: number): Promise<Message | null> {
		const result = await pool.query(
			"SELECT * FROM messages WHERE id = $1",
			[id]
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return Message.fromPersistence(
			row.id,
			row.conversation_id,
			row.from_user_id,
			row.to_user_id,
			row.content,
			Boolean(row.is_read),
			Boolean(row.is_closed),
			Boolean(row.is_system),
			row.created_at
		);
	}

	async findByConversationId(conversationId: string): Promise<Message[]> {
		const result = await pool.query(
			"SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
			[conversationId]
		);

		return result.rows.map(row =>
			Message.fromPersistence(
				row.id,
				row.conversation_id,
				row.from_user_id,
				row.to_user_id,
				row.content,
				Boolean(row.is_read),
				Boolean(row.is_closed),
				Boolean(row.is_system),
				row.created_at
			)
		);
	}

	async markAsRead(messageId: number): Promise<void> {
		await pool.query(
			"UPDATE messages SET is_read = TRUE WHERE id = $1",
			[messageId]
		);
	}

	async getConversationById(conversationId: string): Promise<Conversation | null> {
		const messages = await this.findByConversationId(conversationId);
		if (messages.length === 0) return null;

		const info = await this.getConversationInfo(conversationId);
		if (!info) return null;

		const unreadCount = await this.getUnreadCount(conversationId, UserId.fromNumber(info.client_id));

		return Conversation.fromPersistence(
			info.conversation_id,
			info.client_id,
			info.advisor_id,
			messages,
			info.is_closed,
			unreadCount,
			info.last_message_at,
			info.created_at
		);
	}

	private async getConversationInfo(conversationId: string): Promise<ConversationInfo | null> {
		// Get the first non-system message to identify client_id
		const firstMsgResult = await pool.query(
			`SELECT from_user_id 
			FROM messages 
			WHERE conversation_id = $1 AND is_system = FALSE 
			ORDER BY created_at ASC 
			LIMIT 1`,
			[conversationId]
		);

		if (firstMsgResult.rows.length === 0) return null;
		const clientId = firstMsgResult.rows[0].from_user_id;

		// Pour trouver l'advisor, priorité à to_user_id le plus récent (reflète transferts et assignations)
		const assignedMsgResult = await pool.query(
			`SELECT to_user_id 
			FROM messages 
			WHERE conversation_id = $1 AND to_user_id IS NOT NULL 
			ORDER BY created_at DESC 
			LIMIT 1`,
			[conversationId]
		);
		
		let advisorId = assignedMsgResult.rows.length > 0 ? assignedMsgResult.rows[0].to_user_id : null;
		
		// Si aucun to_user_id, chercher un advisor qui a répondu (from_user_id != client)
		if (!advisorId) {
			const advisorMsgResult = await pool.query(
				`SELECT from_user_id 
				FROM messages 
				WHERE conversation_id = $1 
				  AND is_system = FALSE 
				  AND from_user_id != $2
				ORDER BY created_at DESC 
				LIMIT 1`,
				[conversationId, clientId]
			);
			advisorId = advisorMsgResult.rows.length > 0 ? advisorMsgResult.rows[0].from_user_id : null;
		}

		// Get latest message info
		const latestMsgResult = await pool.query(
			`SELECT is_closed, created_at 
			FROM messages 
			WHERE conversation_id = $1 
			ORDER BY created_at DESC 
			LIMIT 1`,
			[conversationId]
		);

		const isClosed = latestMsgResult.rows.length > 0 ? Boolean(latestMsgResult.rows[0].is_closed) : false;
		const lastMessageAt = latestMsgResult.rows.length > 0 ? latestMsgResult.rows[0].created_at : new Date();

		// Get the creation date from the first message
		const createdMsgResult = await pool.query(
			`SELECT created_at 
			FROM messages 
			WHERE conversation_id = $1 
			ORDER BY created_at ASC 
			LIMIT 1`,
			[conversationId]
		);

		const createdAt = createdMsgResult.rows.length > 0 ? createdMsgResult.rows[0].created_at : new Date();

		return {
			conversation_id: conversationId,
			client_id: clientId!,
			advisor_id: advisorId,
			is_closed: isClosed,
			last_message_at: lastMessageAt,
			created_at: createdAt,
		};
	}

	async getClientConversations(clientId: UserId): Promise<Conversation[]> {
		const result = await pool.query(
			`SELECT conversation_id, MAX(created_at) as last_message_at
			FROM messages 
			WHERE from_user_id = $1 OR to_user_id = $2
			GROUP BY conversation_id
			ORDER BY last_message_at DESC`,
			[clientId.value, clientId.value]
		);

		const conversations: Conversation[] = [];
		for (const row of result.rows) {
			const conv = await this.getConversationById(row.conversation_id);
			if (conv) conversations.push(conv);
		}

		return conversations;
	}

	async getAdvisorConversations(advisorId: UserId): Promise<Conversation[]> {
		// Chercher les conversations où l'advisor apparaît (en tant que destinataire OU expéditeur)
		const result = await pool.query(
			`SELECT conversation_id, MAX(created_at) as last_message_at
			FROM messages 
			WHERE from_user_id = $1 OR to_user_id = $2
			GROUP BY conversation_id
			ORDER BY last_message_at DESC`,
			[advisorId.value, advisorId.value]
		);

		const conversations: Conversation[] = [];
		for (const row of result.rows) {
			const conv = await this.getConversationById(row.conversation_id);
			// Garder les conversations où :
			// 1. Cet advisor est actuellement assigné OU
			// 2. La conversation est fermée ET l'advisor y a participé (apparaît dans from_user_id)
			if (conv) {
				const isCurrentAdvisor = conv.getAdvisorId()?.value === advisorId.value;
				const hasParticipated = conv.getIsClosed() && 
					conv.getMessages().some(m => m.getFromUserId()?.value === advisorId.value);
				
				if (isCurrentAdvisor || hasParticipated) {
					conversations.push(conv);
				}
			}
		}

		return conversations;
	}

	async getUnassignedConversations(): Promise<Conversation[]> {
		const result = await pool.query(
			`SELECT conversation_id, MAX(created_at) as last_message_at
			FROM messages 
			WHERE to_user_id IS NULL AND is_closed = FALSE
			GROUP BY conversation_id
			ORDER BY last_message_at DESC`
		);

		const conversations: Conversation[] = [];
		for (const row of result.rows) {
			const conv = await this.getConversationById(row.conversation_id);
			if (conv) conversations.push(conv);
		}

		return conversations;
	}

	async getAllConversations(): Promise<Conversation[]> {
		const result = await pool.query(
			`SELECT DISTINCT conversation_id 
			FROM messages 
			ORDER BY created_at DESC`
		);

		const conversations: Conversation[] = [];
		for (const row of result.rows) {
			const conv = await this.getConversationById(row.conversation_id);
			if (conv) conversations.push(conv);
		}

		return conversations;
	}

	async assignConversation(conversationId: string, advisorId: UserId): Promise<void> {
		await pool.query(
			`UPDATE messages 
			SET to_user_id = $1 
			WHERE conversation_id = $2 AND to_user_id IS NULL`,
			[advisorId.value, conversationId]
		);
	}

	async transferConversation(conversationId: string, newAdvisorId: UserId): Promise<void> {
		await pool.query(
			`UPDATE messages 
			SET to_user_id = $1 
			WHERE conversation_id = $2`,
			[newAdvisorId.value, conversationId]
		);
	}

	async closeConversation(conversationId: string): Promise<void> {
		await pool.query(
			"UPDATE messages SET is_closed = TRUE WHERE conversation_id = $1",
			[conversationId]
		);
	}

	async getUnreadCount(conversationId: string, userId: UserId): Promise<number> {
		const result = await pool.query(
			`SELECT COUNT(*) as count 
			FROM messages 
			WHERE conversation_id = $1 AND is_read = FALSE AND from_user_id != $2`,
			[conversationId, userId.value]
		);

		return parseInt(result.rows[0]?.count || 0);
	}

	async markConversationAsRead(conversationId: string, userId: UserId): Promise<void> {
		await pool.query(
			`UPDATE messages 
			SET is_read = TRUE 
			WHERE conversation_id = $1 AND from_user_id != $2 AND is_read = FALSE`,
			[conversationId, userId.value]
		);
	}

	async hasOpenConversation(clientId: UserId): Promise<boolean> {
		const result = await pool.query(
			`SELECT COUNT(DISTINCT conversation_id) as count 
			FROM messages 
			WHERE from_user_id = $1 AND is_closed = FALSE`,
			[clientId.value]
		);

		return parseInt(result.rows[0]?.count || 0) > 0;
	}
}