import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { UserId } from "@domain/value-objects/UserId";
import { Message } from "@domain/entities/Message";
import { emailService } from "@infrastructure/services/email.service";

interface TransferConversationDTO {
	conversationId: string;
	newAdvisorId: number;
	currentAdvisorId: number;
}

export class TransferConversation {
	constructor(
		private messageRepository: IMessageRepository,
		private userRepository: IUserRepository
	) {}

	async execute(dto: TransferConversationDTO): Promise<void> {
		const newAdvisorId = UserId.fromNumber(dto.newAdvisorId);
		const currentAdvisorId = UserId.fromNumber(dto.currentAdvisorId);

		// Vérifier que la conversation existe
		const conversation = await this.messageRepository.getConversationById(dto.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		if (!conversation.isAssigned()) {
			throw new Error("Cannot transfer an unassigned conversation");
		}

		if (conversation.getIsClosed()) {
			throw new Error("Cannot transfer a closed conversation");
		}

		// Récupérer les informations des conseillers
		const newAdvisor = await this.userRepository.findById(newAdvisorId);
		const currentAdvisor = await this.userRepository.findById(currentAdvisorId);
		
		if (!newAdvisor || !currentAdvisor) {
			throw new Error("Advisor not found");
		}

		// Transférer la conversation
		await this.messageRepository.transferConversation(dto.conversationId, newAdvisorId);

		// Créer un message système
		const systemMessage = Message.create(
			dto.conversationId,
			null,
			null,
			`Conversation transférée à ${newAdvisor.firstName} ${newAdvisor.lastName}`,
			true
		);

		await this.messageRepository.save(systemMessage);

		// Envoyer les emails de manière asynchrone sans bloquer
		// Email au nouveau conseiller
		emailService.sendConversationTransferredToAdvisorEmail(
			newAdvisor.email.value,
			newAdvisor.firstName,
			`Client`, // On pourrait récupérer le nom du client
			`${currentAdvisor.firstName} ${currentAdvisor.lastName}`
		).catch((error) => {
			console.error('❌ Erreur lors de l\'envoi de l\'email au nouveau conseiller (non bloquant):', error);
		});

		// Email au client
		const clientId = conversation.getClientId();
		const client = await this.userRepository.findById(clientId);
		
		if (client) {
			emailService.sendConversationTransferredToClientEmail(
				client.email.value,
				client.firstName,
				`${newAdvisor.firstName} ${newAdvisor.lastName}`
			).catch((error) => {
				console.error('❌ Erreur lors de l\'envoi de l\'email au client (non bloquant):', error);
			});
		}
	}
}
