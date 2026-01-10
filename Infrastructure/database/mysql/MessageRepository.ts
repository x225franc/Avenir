import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { Message } from "@domain/entities/Message";
import { Conversation } from "@domain/entities/Conversation";
import { UserId } from "@domain/value-objects/UserId";
import { pool } from "./connection";

interface MessageRow extends RowDataPacket {
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
		const connection = await pool.getConnection();

		try {
			const [result] = await connection.query<ResultSetHeader>(
				`INSERT INTO messages 
				(conversation_id, from_user_id, to_user_id, content, is_read, is_closed, is_system, created_at) 
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
				result.insertId,
				message.getConversationId(),
				message.getFromUserId() ? parseInt(message.getFromUserId()!.value) : null,
				message.getToUserId() ? parseInt(message.getToUserId()!.value) : null,
				message.getContent(),
				message.getIsRead(),
				message.getIsClosed(),
				message.getIsSystem(),
				message.getCreatedAt()
			);
		} finally {
			connection.release();
		}
	}

	async findById(id: number): Promise<Message | null> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<MessageRow[]>(
				"SELECT * FROM messages WHERE id = ?",
				[id]
			);

			if (rows.length === 0) return null;

			const row = rows[0];
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
		} finally {
			connection.release();
		}
	}

	async findByConversationId(conversationId: string): Promise<Message[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<MessageRow[]>(
				"SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
				[conversationId]
			);

			return rows.map(row =>
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
		} finally {
			connection.release();
		}
	}

	async markAsRead(messageId: number): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.query(
				"UPDATE messages SET is_read = TRUE WHERE id = ?",
				[messageId]
			);
		} finally {
			connection.release();
		}
	}

	async getConversationById(conversationId: string): Promise<Conversation | null> {
		const connection = await pool.getConnection();

		try {
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
		} finally {
			connection.release();
		}
	}

	private async getConversationInfo(conversationId: string): Promise<ConversationInfo | null> {
		const connection = await pool.getConnection();

		try {
			// Get the first non-system message to identify client_id
			const [firstMsg] = await connection.query<MessageRow[]>(
				`SELECT from_user_id 
				FROM messages 
				WHERE conversation_id = ? AND is_system = FALSE 
				ORDER BY created_at ASC 
				LIMIT 1`,
				[conversationId]
			);

			if (firstMsg.length === 0) return null;
			const clientId = firstMsg[0].from_user_id;

		// Pour trouver l'advisor, priorité à to_user_id le plus récent (reflète transferts et assignations)
		const [assignedMsg] = await connection.query<MessageRow[]>(
			`SELECT to_user_id 
			FROM messages 
			WHERE conversation_id = ? AND to_user_id IS NOT NULL 
			ORDER BY created_at DESC 
			LIMIT 1`,
			[conversationId]
		);
		
		let advisorId = assignedMsg.length > 0 ? assignedMsg[0].to_user_id : null;
		
		// Si aucun to_user_id, chercher un advisor qui a répondu (from_user_id != client)
		if (!advisorId) {
			const [advisorMsg] = await connection.query<MessageRow[]>(
				`SELECT from_user_id 
				FROM messages 
				WHERE conversation_id = ? 
				  AND is_system = FALSE 
				  AND from_user_id != ?
				ORDER BY created_at DESC 
				LIMIT 1`,
				[conversationId, clientId]
			);
			advisorId = advisorMsg.length > 0 ? advisorMsg[0].from_user_id : null;
		}			// Get latest message info
			const [latestMsg] = await connection.query<MessageRow[]>(
				`SELECT is_closed, created_at 
				FROM messages 
				WHERE conversation_id = ? 
				ORDER BY created_at DESC 
				LIMIT 1`,
				[conversationId]
			);

			const isClosed = latestMsg.length > 0 ? Boolean(latestMsg[0].is_closed) : false;
			const lastMessageAt = latestMsg.length > 0 ? latestMsg[0].created_at : new Date();

			// Get the creation date from the first message
			const [createdMsg] = await connection.query<MessageRow[]>(
				`SELECT created_at 
				FROM messages 
				WHERE conversation_id = ? 
				ORDER BY created_at ASC 
				LIMIT 1`,
				[conversationId]
			);

			const createdAt = createdMsg.length > 0 ? createdMsg[0].created_at : new Date();

			return {
				conversation_id: conversationId,
				client_id: clientId!,
				advisor_id: advisorId,
				is_closed: isClosed,
				last_message_at: lastMessageAt,
				created_at: createdAt,
			};
		} finally {
			connection.release();
		}
	}

	async getClientConversations(clientId: UserId): Promise<Conversation[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<(MessageRow & RowDataPacket)[]>(
				`SELECT conversation_id, MAX(created_at) as last_message_at
				FROM messages 
				WHERE from_user_id = ? OR to_user_id = ?
				GROUP BY conversation_id
				ORDER BY last_message_at DESC`,
				[clientId.value, clientId.value]
			);

			const conversations: Conversation[] = [];
			for (const row of rows) {
				const conv = await this.getConversationById(row.conversation_id);
				if (conv) conversations.push(conv);
			}

			return conversations;
		} finally {
			connection.release();
		}
	}

	async getAdvisorConversations(advisorId: UserId): Promise<Conversation[]> {
		const connection = await pool.getConnection();

		try {
			// Récupérer les conversations où cet advisor apparaît (from_user_id OU to_user_id)
			// Puis filtrer via getConversationInfo pour garder celles où il est actuellement assigné
			const [rows] = await connection.query<(MessageRow & RowDataPacket)[]>(
				`SELECT DISTINCT conversation_id, MAX(created_at) as last_message_at
				FROM messages 
				WHERE from_user_id = ? OR to_user_id = ?
				GROUP BY conversation_id
				ORDER BY last_message_at DESC`,
				[advisorId.value, advisorId.value]
			);

			const conversations: Conversation[] = [];
			for (const row of rows) {
				const conv = await this.getConversationById(row.conversation_id);
				if (conv) {
					const isCurrentlyAssigned = conv.getAdvisorId()?.value === advisorId.value;
					const isClosedAndParticipated = conv.getIsClosed() && 
						conv.getMessages().some(m => 
							m.getFromUserId()?.value === advisorId.value || 
							m.getToUserId()?.value === advisorId.value
						);
					
					// Garder si advisor actuellement assigné OU si conversation fermée avec participation
					if (isCurrentlyAssigned || isClosedAndParticipated) {
						conversations.push(conv);
					}
				}
			}
			
			return conversations;
		} finally {
			connection.release();
		}
	}

	async getUnassignedConversations(): Promise<Conversation[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<(MessageRow & RowDataPacket)[]>(
				`SELECT conversation_id, MAX(created_at) as last_message_at
				FROM messages 
				WHERE to_user_id IS NULL AND is_closed = FALSE
				GROUP BY conversation_id
				ORDER BY last_message_at DESC`
			);

			const conversations: Conversation[] = [];
			for (const row of rows) {
				const conv = await this.getConversationById(row.conversation_id);
				if (conv) conversations.push(conv);
			}

			return conversations;
		} finally {
			connection.release();
		}
	}

	async getAllConversations(): Promise<Conversation[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<(MessageRow & RowDataPacket)[]>(
				`SELECT DISTINCT conversation_id 
				FROM messages 
				ORDER BY created_at DESC`
			);

			const conversations: Conversation[] = [];
			for (const row of rows) {
				const conv = await this.getConversationById(row.conversation_id);
				if (conv) conversations.push(conv);
			}

			return conversations;
		} finally {
			connection.release();
		}
	}

	async assignConversation(conversationId: string, advisorId: UserId): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.query(
				`UPDATE messages 
				SET to_user_id = ? 
				WHERE conversation_id = ? AND to_user_id IS NULL`,
				[advisorId.value, conversationId]
			);
		} finally {
			connection.release();
		}
	}

	async transferConversation(conversationId: string, newAdvisorId: UserId): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.query(
				`UPDATE messages 
				SET to_user_id = ? 
				WHERE conversation_id = ?`,
				[newAdvisorId.value, conversationId]
			);
		} finally {
			connection.release();
		}
	}

	async closeConversation(conversationId: string): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.query(
				"UPDATE messages SET is_closed = 1 WHERE conversation_id = ?",
				[conversationId]
			);
		} finally {
			connection.release();
		}
	}

	async getUnreadCount(conversationId: string, userId: UserId): Promise<number> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<(RowDataPacket & { count: number })[]>(
				`SELECT COUNT(*) as count 
				FROM messages 
				WHERE conversation_id = ? AND is_read = FALSE AND from_user_id != ?`,
				[conversationId, userId.value]
			);

			return rows[0]?.count || 0;
		} finally {
			connection.release();
		}
	}

	async markConversationAsRead(conversationId: string, userId: UserId): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.query(
				`UPDATE messages 
				SET is_read = TRUE 
				WHERE conversation_id = ? AND from_user_id != ? AND is_read = FALSE`,
				[conversationId, userId.value]
			);
		} finally {
			connection.release();
		}
	}

	async hasOpenConversation(clientId: UserId): Promise<boolean> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<(RowDataPacket & { count: number })[]>(
				`SELECT COUNT(DISTINCT conversation_id) as count 
				FROM messages 
				WHERE from_user_id = ? AND is_closed = FALSE`,
				[clientId.value]
			);

			return (rows[0]?.count || 0) > 0;
		} finally {
			connection.release();
		}
	}
}