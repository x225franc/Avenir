import { Request, Response } from "express";
import { InternalMessageRepository } from "../../../../Infrastructure/database/mysql/InternalMessageRepository";
import { UserRepository } from "../../../../Infrastructure/database/mysql/UserRepository";
import { SendInternalMessage } from "../../../../Application/use-cases/internal-message/SendInternalMessage";
import { GetInternalMessages } from "../../../../Application/use-cases/internal-message/GetInternalMessages";
import { GetStaffMembers } from "../../../../Application/use-cases/internal-message/GetStaffMembers";
import { getMessageSocketService } from "../../../../Infrastructure/services/MessageSocketService";

export class InternalMessageController {
	private internalMessageRepository: InternalMessageRepository;
	private userRepository: UserRepository;

	constructor() {
		this.internalMessageRepository = new InternalMessageRepository();
		this.userRepository = new UserRepository();
	}

	/**
	 * POST /api/internal-messages
	 * Envoyer un message interne (groupe ou direct)
	 */
	async sendMessage(req: Request, res: Response): Promise<void> {
		try {
			const { fromUserId, content, isGroupMessage, toUserId } = req.body;

			if (!fromUserId || !content) {
				res.status(400).json({
					success: false,
					error: "fromUserId et content sont requis",
				});
				return;
			}

			const sendMessage = new SendInternalMessage(
				this.internalMessageRepository
			);
			const message = await sendMessage.execute(
				fromUserId,
				content,
				isGroupMessage || false,
				toUserId
			);

			// Émettre l'événement WebSocket
			try {
				const socketService = getMessageSocketService();
				socketService.emitInternalMessage({
					id: message.getId().getValue(),
					fromUserId: message.getFromUserId().value,
					toUserId: message.getToUserId()?.value || null,
					content: message.getContent(),
					isGroupMessage: message.getIsGroupMessage(),
					isRead: message.getIsRead(),
					createdAt: message.getCreatedAt(),
				});
			} catch (error) {
				console.warn("Could not emit WebSocket event:", error);
			}

			res.status(201).json({
				success: true,
				data: {
					id: message.getId().getValue(),
					fromUserId: message.getFromUserId().value,
					toUserId: message.getToUserId()?.value || null,
					content: message.getContent(),
					isGroupMessage: message.getIsGroupMessage(),
					createdAt: message.getCreatedAt(),
				},
			});
		} catch (error: any) {
			console.error("Error in sendMessage:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Erreur serveur lors de l'envoi du message",
			});
		}
	}

	/**
	 * GET /api/internal-messages?userId=X&type=group|direct&otherUserId=Y
	 * Récupérer les messages internes
	 */
	async getMessages(req: Request, res: Response): Promise<void> {
		try {
			const { userId, type, otherUserId } = req.query;

			if (!userId) {
				res.status(400).json({
					success: false,
					error: "userId est requis",
				});
				return;
			}

			const getMessages = new GetInternalMessages(
				this.internalMessageRepository
			);
			const messages = await getMessages.execute(
				userId as string,
				(type as "group" | "direct") || "group",
				otherUserId as string
			);

			res.status(200).json({
				success: true,
				data: messages.map((msg) => ({
					id: msg.getId().getValue(),
					fromUserId: msg.getFromUserId().value,
					toUserId: msg.getToUserId()?.value || null,
					content: msg.getContent(),
					isGroupMessage: msg.getIsGroupMessage(),
					isRead: msg.getIsRead(),
					createdAt: msg.getCreatedAt(),
				})),
			});
		} catch (error: any) {
			console.error("Error in getMessages:", error);
			res.status(500).json({
				success: false,
				error:
					error.message ||
					"Erreur serveur lors de la récupération des messages",
			});
		}
	}

	/**
	 * GET /api/staff-members
	 * Récupérer tous les conseillers et directeurs
	 */
	async getStaffMembers(req: Request, res: Response): Promise<void> {
		try {
			const getStaff = new GetStaffMembers(this.userRepository);
			const staffMembers = await getStaff.execute();

			res.status(200).json({
				success: true,
				data: staffMembers.map((member) => ({
					id: member.id.value,
					firstName: member.firstName,
					lastName: member.lastName,
					fullName: member.fullName,
					email: member.email.value,
					role: member.role,
				})),
			});
		} catch (error: any) {
			console.error("Error in getStaffMembers:", error);
			res.status(500).json({
				success: false,
				error:
					error.message ||
					"Erreur serveur lors de la récupération du personnel",
			});
		}
	}
}
