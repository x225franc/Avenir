import { MessageId } from "@domain/value-objects/MessageId";
import { UserId } from "@domain/value-objects/UserId";

export class Message {
	private id: MessageId | null;
	private conversationId: string;
	private fromUserId: UserId | null;
	private toUserId: UserId | null;
	private content: string;
	private isRead: boolean;
	private isClosed: boolean;
	private isSystem: boolean;
	private createdAt: Date;

	private constructor(
		id: MessageId | null,
		conversationId: string,
		fromUserId: UserId | null,
		toUserId: UserId | null,
		content: string,
		isRead: boolean,
		isClosed: boolean,
		isSystem: boolean,
		createdAt: Date
	) {
		this.id = id;
		this.conversationId = conversationId;
		this.fromUserId = fromUserId;
		this.toUserId = toUserId;
		this.content = content;
		this.isRead = isRead;
		this.isClosed = isClosed;
		this.isSystem = isSystem;
		this.createdAt = createdAt;
	}

	static create(
		conversationId: string,
		fromUserId: UserId | null,
		toUserId: UserId | null,
		content: string,
		isSystem: boolean = false,
		isClosed: boolean = false
	): Message {
		if (!conversationId || conversationId.trim().length === 0) {
			throw new Error("Conversation ID is required");
		}
		if (!content || content.trim().length === 0) {
			throw new Error("Message content is required");
		}
		if (!isSystem && !fromUserId) {
			throw new Error("From user ID is required for non-system messages");
		}

		return new Message(
			null,
			conversationId,
			fromUserId,
			toUserId,
			content,
			false,
			isClosed,
			isSystem,
			new Date()
		);
	}

	static fromPersistence(
		id: number,
		conversationId: string,
		fromUserId: number | null,
		toUserId: number | null,
		content: string,
		isRead: boolean,
		isClosed: boolean,
		isSystem: boolean,
		createdAt: Date
	): Message {
		return new Message(
			MessageId.create(id),
			conversationId,
			fromUserId ? UserId.fromNumber(fromUserId) : null,
			toUserId ? UserId.fromNumber(toUserId) : null,
			content,
			isRead,
			isClosed,
			isSystem,
			createdAt
		);
	}

	// Getters
	getId(): MessageId | null {
		return this.id;
	}

	getConversationId(): string {
		return this.conversationId;
	}

	getFromUserId(): UserId | null {
		return this.fromUserId;
	}

	getToUserId(): UserId | null {
		return this.toUserId;
	}

	getContent(): string {
		return this.content;
	}

	getIsRead(): boolean {
		return this.isRead;
	}

	getIsClosed(): boolean {
		return this.isClosed;
	}

	getIsSystem(): boolean {
		return this.isSystem;
	}

	getCreatedAt(): Date {
		return this.createdAt;
	}

	// Actions
	markAsRead(): void {
		this.isRead = true;
	}

	closeConversation(): void {
		this.isClosed = true;
	}

	assignTo(advisorId: UserId): void {
		this.toUserId = advisorId;
	}
}
