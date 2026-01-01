import { pool } from "./connection";
import { InternalMessage } from "../../../Domain/entities/InternalMessage";
import { InternalMessageId } from "../../../Domain/value-objects/InternalMessageId";
import { UserId } from "../../../Domain/value-objects/UserId";
import { IInternalMessageRepository } from "../../../Domain/repositories/IInternalMessageRepository";

interface InternalMessageRow {
	id: number;
	from_user_id: number;
	to_user_id: number | null;
	content: string;
	is_group_message: boolean;
	is_read: boolean;
	created_at: Date;
}

export class InternalMessageRepository implements IInternalMessageRepository {
	async create(message: InternalMessage): Promise<InternalMessage> {
		const query = `
			INSERT INTO internal_messages (from_user_id, to_user_id, content, is_group_message, is_read)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id
		`;

		const result = await pool.query(query, [
			message.getFromUserId().value,
			message.getToUserId()?.value || null,
			message.getContent(),
			message.getIsGroupMessage(),
			message.getIsRead(),
		]);

		const createdMessage = await this.findById(InternalMessageId.fromNumber(result.rows[0].id));
		if (!createdMessage) {
			throw new Error("Failed to retrieve created internal message");
		}

		return createdMessage;
	}

	async findGroupMessages(): Promise<InternalMessage[]> {
		const query = `
			SELECT * FROM internal_messages
			WHERE is_group_message = true
			ORDER BY created_at ASC
		`;

		const result = await pool.query(query);
		return result.rows.map(this.mapRowToEntity);
	}

	async findDirectMessages(userId1: UserId, userId2: UserId): Promise<InternalMessage[]> {
		const query = `
			SELECT * FROM internal_messages
			WHERE is_group_message = false
			AND (
				(from_user_id = $1 AND to_user_id = $2) OR
				(from_user_id = $3 AND to_user_id = $4)
			)
			ORDER BY created_at ASC
		`;

		const result = await pool.query(query, [
			userId1.value,
			userId2.value,
			userId2.value,
			userId1.value,
		]);

		return result.rows.map(this.mapRowToEntity);
	}

	async findByUserId(userId: UserId): Promise<InternalMessage[]> {
		const query = `
			SELECT * FROM internal_messages
			WHERE is_group_message = true
			OR from_user_id = $1
			OR to_user_id = $2
			ORDER BY created_at ASC
		`;

		const result = await pool.query(query, [
			userId.value,
			userId.value,
		]);

		return result.rows.map(this.mapRowToEntity);
	}

	async markAsRead(messageId: InternalMessageId): Promise<void> {
		const query = `UPDATE internal_messages SET is_read = true WHERE id = $1`;
		await pool.query(query, [messageId.getValue()]);
	}

	async findById(id: InternalMessageId): Promise<InternalMessage | null> {
		const query = `SELECT * FROM internal_messages WHERE id = $1`;
		const result = await pool.query(query, [id.getValue()]);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToEntity(result.rows[0]);
	}

	private mapRowToEntity(row: InternalMessageRow): InternalMessage {
		return InternalMessage.fromPersistence({
			id: InternalMessageId.fromNumber(row.id),
			fromUserId: UserId.fromNumber(row.from_user_id),
			toUserId: row.to_user_id ? UserId.fromNumber(row.to_user_id) : null,
			content: row.content,
			isGroupMessage: row.is_group_message,
			isRead: row.is_read,
			createdAt: new Date(row.created_at),
		});
	}
}