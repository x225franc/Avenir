import { IInvestmentOrderRepository } from "../../../Domain/repositories/IInvestmentOrderRepository";
import { IAccountRepository } from "../../../Domain/repositories/IAccountRepository";
import { InvestmentOrderId } from "../../../Domain/value-objects/InvestmentOrderId";
import { UserId } from "../../../Domain/value-objects/UserId";

export interface CancelInvestmentOrderDTO {
	userId: string;
	orderId: string;
}

export interface CancelInvestmentOrderResult {
	success: boolean;
	message: string;
	errors: string[];
}

/**
 * Use Case : Annuler un ordre d'investissement
 *
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que l'ordre existe
 * - Vérifier que l'utilisateur est propriétaire de l'ordre
 * - Vérifier que l'ordre peut être annulé (statut pending)
 * - Annuler l'ordre
 * - Rembourser les fonds si c'était un ordre d'achat
 */
export class CancelInvestmentOrder {
	constructor(
		private investmentOrderRepository: IInvestmentOrderRepository,
		private accountRepository: IAccountRepository
	) {}

	async execute(
		dto: CancelInvestmentOrderDTO
	): Promise<CancelInvestmentOrderResult> {
		try {
			// Validation des données d'entrée
			if (!dto.userId || !dto.orderId) {
				return {
					success: false,
					message: "Données manquantes",
					errors: ["userId et orderId sont requis"],
				};
			}

			const userId = new UserId(dto.userId);
			const orderId = InvestmentOrderId.fromNumber(parseInt(dto.orderId));

			// Récupérer l'ordre
			const order = await this.investmentOrderRepository.findById(orderId);
			if (!order) {
				return {
					success: false,
					message: "Ordre non trouvé",
					errors: ["L'ordre spécifié n'existe pas"],
				};
			}

			// Vérifier que l'utilisateur est propriétaire de l'ordre
			if (!order.userId.equals(userId)) {
				return {
					success: false,
					message: "Accès non autorisé",
					errors: ["Cet ordre ne vous appartient pas"],
				};
			}

			// Vérifier que l'ordre peut être annulé
			if (!order.canBeCancelled()) {
				return {
					success: false,
					message: "Ordre non annulable",
					errors: [
						`L'ordre est en statut '${order.status}' et ne peut pas être annulé`,
					],
				};
			}

			// Si c'était un ordre d'achat, rembourser les fonds
			if (order.isBuyOrder()) {
				const account = await this.accountRepository.findById(order.accountId);
				if (account) {
					account.credit(order.totalAmount);
					await this.accountRepository.save(account);
				}
			}

			// Annuler l'ordre
			order.cancel();
			await this.investmentOrderRepository.save(order);

			return {
				success: true,
				message: `✅ Ordre ${
					order.isBuyOrder() ? "d'achat" : "de vente"
				} annulé avec succès`,
				errors: [],
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Erreur inconnue";
			console.error(`[CancelInvestmentOrder] Erreur:`, error);

			return {
				success: false,
				message: "Erreur lors de l'annulation de l'ordre",
				errors: [errorMessage],
			};
		}
	}
}
