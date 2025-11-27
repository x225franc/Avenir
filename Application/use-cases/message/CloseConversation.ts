import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { Message } from "@domain/entities/Message";

interface CloseConversationDTO {
	conversationId: string;
	advisorId: number;
}

export class CloseConversation {
	constructor(private messageRepository: IMessageRepository) {}

	async execute(dto: CloseConversationDTO): Promise<void> {
		// Vérifier que la conversation existe
		const conversation = await this.messageRepository.getConversationById(dto.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		if (conversation.getIsClosed()) {
			throw new Error("Conversation is already closed");
		}

		// Fermer la conversation
		await this.messageRepository.closeConversation(dto.conversationId);

		// Créer un message système
		const systemMessage = Message.create(
			dto.conversationId,
			null,
			null,
			`Conversation clôturée`,
			true,
			true
		);

		await this.messageRepository.save(systemMessage);
	}
}
