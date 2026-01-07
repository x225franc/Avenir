import { IAccountRepository } from "../../../Domain/repositories/IAccountRepository";
import { IStockRepository } from "../../../Domain/repositories/IStockRepository";
import { IInvestmentOrderRepository } from "../../../Domain/repositories/IInvestmentOrderRepository";
import { ITransactionRepository } from "../../../Domain/repositories/ITransactionRepository";
import { IBankSettingsRepository } from "../../../Domain/repositories/IBankSettingsRepository";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { UserId } from "../../../Domain/value-objects/UserId";
import { StockId } from "../../../Domain/value-objects/StockId";
import {
	InvestmentOrder,
	OrderType,
} from "../../../Domain/entities/InvestmentOrder";
import { Transaction } from "../../../Domain/entities/Transaction";
import { TransactionType } from "../../../Domain/enums/TransactionType";
import { Money } from "../../../Domain/value-objects/Money";
import { AccountType } from "../../../Domain/entities/Account";

export interface PlaceInvestmentOrderDTO {
	userId: string;
	accountId: string;
	stockId: string;
	orderType: "buy" | "sell";
	quantity: number;
}

export interface PlaceInvestmentOrderResult {
	success: boolean;
	orderId?: string;
	message: string;
	errors: string[];
}

/**
 * Use Case : Placer un ordre d'investissement
 *
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que l'utilisateur possède le compte
 * - Vérifier que le compte est un compte d'investissement actif
 * - Vérifier que l'action existe et est disponible
 * - Pour les achats : vérifier que le solde est suffisant
 * - Pour les ventes : vérifier que l'utilisateur possède suffisamment d'actions
 * - Créer l'ordre d'investissement
 * - Exécuter immédiatement l'ordre (débiter/créditer le compte)
 * - Enregistrer la transaction correspondante
 */
export class PlaceInvestmentOrder {
	constructor(
		private accountRepository: IAccountRepository,
		private stockRepository: IStockRepository,
		private investmentOrderRepository: IInvestmentOrderRepository,
		private transactionRepository: ITransactionRepository,
		private bankSettingsRepository: IBankSettingsRepository
	) {}

	async execute(
		dto: PlaceInvestmentOrderDTO
	): Promise<PlaceInvestmentOrderResult> {
		const errors: string[] = [];

		try {
			// Validation des données d'entrée
			if (!dto.userId || !dto.accountId || !dto.stockId) {
				return {
					success: false,
					message: "Données manquantes",
					errors: ["userId, accountId et stockId sont requis"],
				};
			}

			if (dto.quantity <= 0) {
				return {
					success: false,
					message: "Quantité invalide",
					errors: ["La quantité doit être positive"],
				};
			}

			if (!["buy", "sell"].includes(dto.orderType)) {
				return {
					success: false,
					message: "Type d'ordre invalide",
					errors: ["Le type d'ordre doit être 'buy' ou 'sell'"],
				};
			}

			const userId = new UserId(dto.userId);
			const accountId = new AccountId(dto.accountId);
			const stockId = StockId.fromNumber(parseInt(dto.stockId));

			// Récupérer les frais d'investissement depuis les paramètres
			const transactionFee = await this.bankSettingsRepository.getInvestmentFee();

			// Vérifier que le compte existe et appartient à l'utilisateur
			const account = await this.accountRepository.findById(accountId);
			if (!account) {
				return {
					success: false,
					message: "Compte non trouvé",
					errors: ["Le compte spécifié n'existe pas"],
				};
			}

			if (!account.userId.equals(userId)) {
				return {
					success: false,
					message: "Accès non autorisé",
					errors: ["Ce compte ne vous appartient pas"],
				};
			}

			if (!account.isActive) {
				return {
					success: false,
					message: "Compte inactif",
					errors: ["Ce compte est désactivé"],
				};
			}

			if (account.accountType !== AccountType.INVESTMENT) {
				return {
					success: false,
					message: "Type de compte invalide",
					errors: [
						"Seuls les comptes d'investissement peuvent passer des ordres",
					],
				};
			}

			// Vérifier que l'action existe et est disponible
			const stock = await this.stockRepository.findById(stockId);
			if (!stock) {
				return {
					success: false,
					message: "Action non trouvée",
					errors: ["L'action spécifiée n'existe pas"],
				};
			}

			if (!stock.canBeTraded()) {
				return {
					success: false,
					message: "Action non disponible",
					errors: ["Cette action n'est pas disponible à la négociation"],
				};
			}

			// Créer l'ordre selon le type
			let order: InvestmentOrder;

			if (dto.orderType === "buy") {
				// Ordre d'achat
				const totalCost = stock.calculateTotalCost(dto.quantity, transactionFee);

				// Vérifier que le solde est suffisant
				if (!account.hasEnoughBalance(totalCost)) {
					return {
						success: false,
						message: "Solde insuffisant",
						errors: [
							`Solde requis: ${totalCost.formatted}, Solde disponible: ${account.balance.formatted}`,
						],
					};
				}

				order = InvestmentOrder.createBuyOrder({
					userId,
					accountId,
					stockId,
					quantity: dto.quantity,
					pricePerShare: stock.currentPrice,
					transactionFee,
				});

				// Débiter le compte immédiatement
				account.debit(totalCost);
			} else {
				// Ordre de vente
				// Vérifier que l'utilisateur possède suffisamment d'actions
				const executedOrders =
					await this.investmentOrderRepository.findExecutedOrdersByUserId(
						userId
					);
				const netQuantity = this.calculateNetStockQuantity(
					stockId,
					executedOrders
				);

				if (netQuantity < dto.quantity) {
					return {
						success: false,
						message: "Actions insuffisantes",
						errors: [
							`Vous possédez ${netQuantity} actions, mais voulez en vendre ${dto.quantity}`,
						],
					};
				}

				const saleAmount = stock.calculateSaleAmount(dto.quantity, transactionFee);

				order = InvestmentOrder.createSellOrder({
					userId,
					accountId,
					stockId,
					quantity: dto.quantity,
					pricePerShare: stock.currentPrice,
					transactionFee,
				});

				// Créditer le compte immédiatement
				account.credit(saleAmount);
			}

			// Exécuter l'ordre immédiatement (banque moderne, pas de carnet d'ordres complexe)
			order.execute();

			// Sauvegarder l'ordre et le compte
			await this.investmentOrderRepository.save(order);
			await this.accountRepository.save(account);

			// Créer la transaction correspondante
			const transactionType =
				dto.orderType === "buy"
					? TransactionType.INVESTMENT_BUY
					: TransactionType.INVESTMENT_SELL;
			const transactionDescription = `${
				dto.orderType === "buy" ? "Achat" : "Vente"
			} de ${dto.quantity} actions ${stock.symbol} à ${
				stock.currentPrice.formatted
			}`;

			const transaction = Transaction.create(
				dto.orderType === "buy" ? accountId : null,
				dto.orderType === "buy" ? null : accountId,
				order.getAccountImpact(),
				transactionType,
				transactionDescription
			);

			transaction.complete();
			await this.transactionRepository.save(transaction);

			return {
				success: true,
				orderId: order.id.value,
				message: `Ordre ${
					dto.orderType === "buy" ? "d'achat" : "de vente"
				} de ${dto.quantity} actions ${stock.symbol} exécuté avec succès`,
				errors: [],
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Erreur inconnue";
			console.error(`[PlaceInvestmentOrder] Erreur:`, error);

			return {
				success: false,
				message: "Erreur lors du placement de l'ordre",
				errors: [errorMessage],
			};
		}
	}

	/**
	 * Calcule la quantité nette d'actions possédées pour une action donnée
	 */
	private calculateNetStockQuantity(
		stockId: StockId,
		executedOrders: InvestmentOrder[]
	): number {
		let netQuantity = 0;

		for (const order of executedOrders) {
			if (order.stockId.equals(stockId)) {
				if (order.isBuyOrder()) {
					netQuantity += order.quantity;
				} else {
					netQuantity -= order.quantity;
				}
			}
		}

		return netQuantity;
	}
}
