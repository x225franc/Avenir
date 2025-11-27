import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { Message } from "@domain/entities/Message";
import { UserId } from "@domain/value-objects/UserId";
import { emailService } from "@infrastructure/services/email.service";

interface SendMessageDTO {
	conversationId: string;
	fromUserId: number;
	toUserId?: number;
	content: string;
	isSystem?: boolean;
}

export class SendMessage {
	constructor(
		private messageRepository: IMessageRepository,
		private userRepository: IUserRepository
	) {}

	async execute(dto: SendMessageDTO): Promise<Message> {
		const fromUserId = UserId.fromNumber(dto.fromUserId);
		const toUserId = dto.toUserId ? UserId.fromNumber(dto.toUserId) : null;

		// Vérifier si la conversation est fermée
		const conversation = await this.messageRepository.getConversationById(dto.conversationId);
		if (conversation && !conversation.canReceiveMessages()) {
			throw new Error("Cannot send message to a closed conversation");
		}

		// Créer le message
		const message = Message.create(
			dto.conversationId,
			fromUserId,
			toUserId,
			dto.content,
			dto.isSystem || false
		);

		// Sauvegarder le message
		const savedMessage = await this.messageRepository.save(message);

		// Envoyer les notifications email de manière asynchrone sans bloquer
		if (!dto.isSystem) {
			this.sendEmailNotifications(savedMessage, conversation).catch((error) => {
				console.error('❌ Erreur lors de l\'envoi de l\'email (non bloquant):', error);
			});
		}

		return savedMessage;
	}

	private async sendEmailNotifications(message: Message, conversation: any): Promise<void> {
		const fromUserId = message.getFromUserId();
		const toUserId = message.getToUserId();

		if (!fromUserId) return;

		const fromUser = await this.userRepository.findById(fromUserId);
		if (!fromUser) return;

		const senderName = `${fromUser.firstName} ${fromUser.lastName}`;

		// Si le message est envoyé par un client (pas d'advisor assigné ou nouveau message dans conversation non assignée)
		if (fromUser.role === "client") {
			if (!conversation || !conversation.isAssigned()) {
				// Nouvelle demande - notifier tous les conseillers
				await this.notifyAllAdvisors(senderName);
			} else if (toUserId) {
				// Réponse du client - notifier le conseiller assigné
				const advisor = await this.userRepository.findById(toUserId);
				if (advisor) {
					await emailService.sendNewMessageNotification(
						advisor.email.value,
						advisor.firstName,
						senderName,
						message.getContent()
					);
				}
			}
		}
		// Si le message est envoyé par un conseiller
		else if (fromUser.role === "advisor" && conversation) {
			const clientId = conversation.getClientId();
			const client = await this.userRepository.findById(clientId);
			if (client) {
				await emailService.sendNewMessageNotification(
					client.email.value,
					client.firstName,
					senderName,
					message.getContent()
				);
			}
		}
	}

	private async notifyAllAdvisors(clientName: string): Promise<void> {
		// Récupérer tous les conseillers
		const advisors = await this.userRepository.findByRole("advisor");
		
		for (const advisor of advisors) {
			await emailService.sendNewConversationNotification(
				advisor.email.value,
				advisor.firstName,
				clientName
			);
		}
	}
}
