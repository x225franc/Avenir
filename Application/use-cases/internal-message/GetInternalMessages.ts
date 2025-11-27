import { InternalMessage } from "../../../Domain/entities/InternalMessage";
import { IInternalMessageRepository } from "../../../Domain/repositories/IInternalMessageRepository";
import { UserId } from "../../../Domain/value-objects/UserId";

export class GetInternalMessages {
	constructor(private internalMessageRepository: IInternalMessageRepository) {}

	async execute(userId: string, conversationType: "group" | "direct" = "group", otherUserId?: string): Promise<InternalMessage[]> {
		const user = UserId.fromString(userId);

		if (conversationType === "group") {
			return await this.internalMessageRepository.findGroupMessages();
		}

		if (conversationType === "direct" && otherUserId) {
			const otherUser = UserId.fromString(otherUserId);
			return await this.internalMessageRepository.findDirectMessages(user, otherUser);
		}

		// Par défaut, retourner tous les messages de l'utilisateur
		return await this.internalMessageRepository.findByUserId(user);
	}
}
