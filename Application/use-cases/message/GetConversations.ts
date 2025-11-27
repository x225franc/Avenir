import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { Conversation } from "@domain/entities/Conversation";
import { UserId } from "@domain/value-objects/UserId";

interface GetConversationsDTO {
	userId: number;
	role: "client" | "advisor";
}

export class GetConversations {
	constructor(private messageRepository: IMessageRepository) {}

	async execute(dto: GetConversationsDTO): Promise<Conversation[]> {
		const userId = UserId.fromNumber(dto.userId);

		if (dto.role === "client") {
			return await this.messageRepository.getClientConversations(userId);
		} else if (dto.role === "advisor") {
			// Pour un conseiller, on récupère ses conversations + les non-assignées
			const assignedConversations = await this.messageRepository.getAdvisorConversations(userId);
			const unassignedConversations = await this.messageRepository.getUnassignedConversations();

			// Fusionner et dédupliquer
			const allConversations = [...assignedConversations, ...unassignedConversations];
			const uniqueConversations = allConversations.filter(
				(conv, index, self) => index === self.findIndex(c => c.getId() === conv.getId())
			);

			// Trier par date du dernier message (plus récent en premier)
			return uniqueConversations.sort((a, b) => 
				b.getLastMessageAt().getTime() - a.getLastMessageAt().getTime()
			);
		}

		return [];
	}
}
