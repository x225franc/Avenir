import { RowDataPacket } from "mysql2";
import { pool } from "./connection";
import { InternalMessage } from "../../../Domain/entities/InternalMessage";
import { InternalMessageId } from "../../../Domain/value-objects/InternalMessageId";
import { UserId } from "../../../Domain/value-objects/UserId";
import { IInternalMessageRepository } from "../../../Domain/repositories/IInternalMessageRepository";

interface InternalMessageRow extends RowDataPacket {
	id: number;
	from_user_id: number;
	to_user_id: number | null;
	content: string;
	is_group_message: number;
	is_read: number;
	created_at: Date;
}

export class InternalMessageRepository implements IInternalMessageRepository {
	async create(message: InternalMessage): Promise<InternalMessage> {
		const query = `
			INSERT INTO internal_messages (from_user_id, to_user_id, content, is_group_message, is_read)
			VALUES (?, ?, ?, ?, ?)
		`;

		const [result]: any = await pool.query(query, [
			message.getFromUserId().value,
			message.getToUserId()?.value || null,
			message.getContent(),
			message.getIsGroupMessage() ? 1 : 0,
			message.getIsRead() ? 1 : 0,
		]);

		const createdMessage = await this.findById(InternalMessageId.fromNumber(result.insertId));
		if (!createdMessage) {
			throw new Error("Failed to retrieve created internal message");
		}

		return createdMessage;
	}

	async findGroupMessages(): Promise<InternalMessage[]> {
		const query = `
			SELECT * FROM internal_messages
			WHERE is_group_message = 1
			ORDER BY created_at ASC
		`;

		const [rows] = await pool.query<InternalMessageRow[]>(query);
		return rows.map(this.mapRowToEntity);
	}

	async findDirectMessages(userId1: UserId, userId2: UserId): Promise<InternalMessage[]> {
		const query = `
			SELECT * FROM internal_messages
			WHERE is_group_message = 0
			AND (
				(from_user_id = ? AND to_user_id = ?) OR
				(from_user_id = ? AND to_user_id = ?)
			)
			ORDER BY created_at ASC
		`;

		const [rows] = await pool.query<InternalMessageRow[]>(query, [
			userId1.value,
			userId2.value,
			userId2.value,
			userId1.value,
		]);

		return rows.map(this.mapRowToEntity);
	}

	async findByUserId(userId: UserId): Promise<InternalMessage[]> {
		const query = `
			SELECT * FROM internal_messages
			WHERE is_group_message = 1
			OR from_user_id = ?
			OR to_user_id = ?
			ORDER BY created_at ASC
		`;

		const [rows] = await pool.query<InternalMessageRow[]>(query, [
			userId.value,
			userId.value,
		]);

		return rows.map(this.mapRowToEntity);
	}

	async markAsRead(messageId: InternalMessageId): Promise<void> {
		const query = `UPDATE internal_messages SET is_read = 1 WHERE id = ?`;
		await pool.query(query, [messageId.getValue()]);
	}

	async findById(id: InternalMessageId): Promise<InternalMessage | null> {
		const query = `SELECT * FROM internal_messages WHERE id = ?`;
		const [rows] = await pool.query<InternalMessageRow[]>(query, [id.getValue()]);

		if (rows.length === 0) {
			return null;
		}

		return this.mapRowToEntity(rows[0]);
	}

	private mapRowToEntity(row: InternalMessageRow): InternalMessage {
		return InternalMessage.fromPersistence({
			id: InternalMessageId.fromNumber(row.id),
			fromUserId: UserId.fromNumber(row.from_user_id),
			toUserId: row.to_user_id ? UserId.fromNumber(row.to_user_id) : null,
			content: row.content,
			isGroupMessage: row.is_group_message === 1,
			isRead: row.is_read === 1,
			createdAt: new Date(row.created_at),
		});
	}
}
