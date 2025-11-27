import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { UserId } from "@domain/value-objects/UserId";

interface CheckOpenConversationDTO {
	clientId: number;
}

export class CheckOpenConversation {
	constructor(private messageRepository: IMessageRepository) {}

	async execute(dto: CheckOpenConversationDTO): Promise<boolean> {
		const clientId = UserId.fromNumber(dto.clientId);
		return await this.messageRepository.hasOpenConversation(clientId);
	}
}
