import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { UserId } from "@domain/value-objects/UserId";

interface MarkAsReadDTO {
	conversationId: string;
	userId: number;
}

export class MarkConversationAsRead {
	constructor(private messageRepository: IMessageRepository) {}

	async execute(dto: MarkAsReadDTO): Promise<void> {
		const userId = UserId.fromNumber(dto.userId);
		await this.messageRepository.markConversationAsRead(dto.conversationId, userId);
	}
}
