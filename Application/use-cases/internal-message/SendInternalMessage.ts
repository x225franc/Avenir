import { InternalMessage } from "../../../Domain/entities/InternalMessage";
import { IInternalMessageRepository } from "../../../Domain/repositories/IInternalMessageRepository";
import { UserId } from "../../../Domain/value-objects/UserId";

export class SendInternalMessage {
	constructor(private internalMessageRepository: IInternalMessageRepository) {}

	async execute(
		fromUserId: string,
		content: string,
		isGroupMessage: boolean = false,
		toUserId?: string
	): Promise<InternalMessage> {
		if (!content || content.trim().length === 0) {
			throw new Error("Le contenu du message ne peut pas être vide");
		}

		const fromUser = UserId.fromString(fromUserId);
		const toUser = toUserId ? UserId.fromString(toUserId) : null;

		const message = InternalMessage.create(fromUser, content, isGroupMessage, toUser);

		return await this.internalMessageRepository.create(message);
	}
}
