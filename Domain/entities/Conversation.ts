import { Message } from "./Message";
import { UserId } from "@domain/value-objects/UserId";

export class Conversation {
	private id: string;
	private clientId: UserId;
	private advisorId: UserId | null;
	private messages: Message[];
	private isClosed: boolean;
	private unreadCount: number;
	private lastMessageAt: Date;
	private createdAt: Date;

	private constructor(
		id: string,
		clientId: UserId,
		advisorId: UserId | null,
		messages: Message[],
		isClosed: boolean,
		unreadCount: number,
		lastMessageAt: Date,
		createdAt: Date
	) {
		this.id = id;
		this.clientId = clientId;
		this.advisorId = advisorId;
		this.messages = messages;
		this.isClosed = isClosed;
		this.unreadCount = unreadCount;
		this.lastMessageAt = lastMessageAt;
		this.createdAt = createdAt;
	}

	static create(clientId: UserId, initialMessage: Message): Conversation {
		const conversationId = `conv_${clientId.value}_${Date.now()}`;
		
		return new Conversation(
			conversationId,
			clientId,
			null,
			[initialMessage],
			false,
			1,
			new Date(),
			new Date()
		);
	}

	static fromPersistence(
		id: string,
		clientId: number,
		advisorId: number | null,
		messages: Message[],
		isClosed: boolean,
		unreadCount: number,
		lastMessageAt: Date,
		createdAt: Date
	): Conversation {
		return new Conversation(
			id,
			UserId.fromNumber(clientId),
			advisorId ? UserId.fromNumber(advisorId) : null,
			messages,
			isClosed,
			unreadCount,
			lastMessageAt,
			createdAt
		);
	}

	// Getters
	getId(): string {
		return this.id;
	}

	getClientId(): UserId {
		return this.clientId;
	}

	getAdvisorId(): UserId | null {
		return this.advisorId;
	}

	getMessages(): Message[] {
		return this.messages;
	}

	getIsClosed(): boolean {
		return this.isClosed;
	}

	getUnreadCount(): number {
		return this.unreadCount;
	}

	getLastMessageAt(): Date {
		return this.lastMessageAt;
	}

	getCreatedAt(): Date {
		return this.createdAt;
	}

	isAssigned(): boolean {
		return this.advisorId !== null;
	}

	canReceiveMessages(): boolean {
		return !this.isClosed;
	}

	addMessage(message: Message): void {
		if (this.isClosed) {
			throw new Error("Cannot add message to a closed conversation");
		}
		this.messages.push(message);
		this.lastMessageAt = new Date();
		this.unreadCount++;
	}

	assignToAdvisor(advisorId: UserId): void {
		if (this.isClosed) {
			throw new Error("Cannot assign a closed conversation");
		}
		this.advisorId = advisorId;
	}

	transferToAdvisor(newAdvisorId: UserId): void {
		if (!this.isAssigned()) {
			throw new Error("Cannot transfer an unassigned conversation");
		}
		if (this.isClosed) {
			throw new Error("Cannot transfer a closed conversation");
		}
		this.advisorId = newAdvisorId;
	}

	close(): void {
		if (this.isClosed) {
			throw new Error("Conversation is already closed");
		}
		this.isClosed = true;
	}

	markAsRead(): void {
		this.unreadCount = 0;
		this.messages.forEach(msg => msg.markAsRead());
	}

	resetUnreadCount(): void {
		this.unreadCount = 0;
	}
}
