import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { Conversation } from "@domain/entities/Conversation";

interface GetConversationDTO {
	conversationId: string;
}

export class GetConversation {
	constructor(private messageRepository: IMessageRepository) {}

	async execute(dto: GetConversationDTO): Promise<Conversation | null> {
		return await this.messageRepository.getConversationById(dto.conversationId);
	}
}
