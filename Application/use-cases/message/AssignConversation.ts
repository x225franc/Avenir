import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { UserId } from "@domain/value-objects/UserId";
import { Message } from "@domain/entities/Message";
import { emailService } from "@infrastructure/services/email.service";

interface AssignConversationDTO {
	conversationId: string;
	advisorId: number;
}

export class AssignConversation {
	constructor(
		private messageRepository: IMessageRepository,
		private userRepository: IUserRepository
	) {}

	async execute(dto: AssignConversationDTO): Promise<void> {
		const advisorId = UserId.fromNumber(dto.advisorId);

		// Vérifier que la conversation existe et n'est pas déjà assignée
		const conversation = await this.messageRepository.getConversationById(dto.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		if (conversation.isAssigned()) {
			throw new Error("Conversation is already assigned");
		}

		// Assigner la conversation
		await this.messageRepository.assignConversation(dto.conversationId, advisorId);

		// Créer un message système
		const advisor = await this.userRepository.findById(advisorId);
		if (!advisor) {
			throw new Error("Advisor not found");
		}

		const systemMessage = Message.create(
			dto.conversationId,
			null,
			null,
			`Demande prise en charge par ${advisor.firstName} ${advisor.lastName}`,
			true
		);

		await this.messageRepository.save(systemMessage);

		// Envoyer un email au client pour l'informer (de manière asynchrone sans bloquer)
		const clientId = conversation.getClientId();
		const client = await this.userRepository.findById(clientId);
		
		if (client) {
			emailService.sendNewMessageNotification(
				client.email.value,
				client.firstName,
				`${advisor.firstName} ${advisor.lastName}`,
				`Votre demande a été prise en charge par ${advisor.firstName} ${advisor.lastName}`
			).catch((error) => {
				console.error('❌ Erreur lors de l\'envoi de l\'email (non bloquant):', error);
			});
		}
	}
}
