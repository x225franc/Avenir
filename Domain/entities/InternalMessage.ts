import { InternalMessageId } from "../value-objects/InternalMessageId";
import { UserId } from "../value-objects/UserId";

export interface InternalMessageProps {
	id: InternalMessageId;
	fromUserId: UserId;
	toUserId?: UserId | null; // null = message de groupe
	content: string;
	isGroupMessage: boolean;
	isRead: boolean;
	createdAt: Date;
}

export class InternalMessage {
	private constructor(private props: InternalMessageProps) {}

	public static create(
		fromUserId: UserId,
		content: string,
		isGroupMessage: boolean = false,
		toUserId?: UserId | null
	): InternalMessage {
		return new InternalMessage({
			id: InternalMessageId.fromNumber(0),
			fromUserId,
			toUserId: toUserId || null,
			content,
			isGroupMessage,
			isRead: false,
			createdAt: new Date(),
		});
	}

	public static fromPersistence(props: InternalMessageProps): InternalMessage {
		return new InternalMessage(props);
	}

	// Getters
	getId(): InternalMessageId {
		return this.props.id;
	}

	getFromUserId(): UserId {
		return this.props.fromUserId;
	}

	getToUserId(): UserId | null | undefined {
		return this.props.toUserId;
	}

	getContent(): string {
		return this.props.content;
	}

	getIsGroupMessage(): boolean {
		return this.props.isGroupMessage;
	}

	getIsRead(): boolean {
		return this.props.isRead;
	}

	getCreatedAt(): Date {
		return this.props.createdAt;
	}

	// Actions
	markAsRead(): void {
		this.props.isRead = true;
	}
}
