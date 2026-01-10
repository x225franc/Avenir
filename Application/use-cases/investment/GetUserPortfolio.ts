import { IInvestmentOrderRepository } from "../../../Domain/repositories/IInvestmentOrderRepository";
import { IStockRepository } from "../../../Domain/repositories/IStockRepository";
import { UserId } from "../../../Domain/value-objects/UserId";
import { StockId } from "../../../Domain/value-objects/StockId";
import { Portfolio } from "../../../Domain/entities/Portfolio";
import { Money } from "../../../Domain/value-objects/Money";

export interface GetUserPortfolioDTO {
	userId: string;
}

export interface GetUserPortfolioResult {
	success: boolean;
	portfolio: PortfolioInfo | null;
	message: string;
	errors: string[];
}

export interface PortfolioInfo {
	userId: string;
	positions: PositionInfo[];
	totalValue: {
		amount: number;
		currency: string;
		formatted: string;
	};
	totalGainLoss: {
		amount: number;
		currency: string;
		formatted: string;
	};
	totalGainLossPercentage: number;
	lastUpdated: string;
}

export interface PositionInfo {
	stockId: string;
	stockSymbol: string;
	companyName: string;
	quantity: number;
	averagePurchasePrice: {
		amount: number;
		currency: string;
		formatted: string;
	};
	currentPrice: {
		amount: number;
		currency: string;
		formatted: string;
	};
	totalValue: {
		amount: number;
		currency: string;
		formatted: string;
	};
	gainLoss: {
		amount: number;
		currency: string;
		formatted: string;
	};
	gainLossPercentage: number;
}

export class GetUserPortfolio {
	constructor(
		private investmentOrderRepository: IInvestmentOrderRepository,
		private stockRepository: IStockRepository
	) {}

	async execute(dto: GetUserPortfolioDTO): Promise<GetUserPortfolioResult> {
		try {
			// 1. Validation des données d'entrée
			if (!dto.userId) {
				return {
					success: false,
					portfolio: null,
					message: "userId est requis",
					errors: ["userId manquant"],
				};
			}

			const userId = new UserId(dto.userId);

			// 2. Récupérer tous les ordres exécutés de l'utilisateur
			const executedOrders =
				await this.investmentOrderRepository.findExecutedOrdersByUserId(userId);

			// 3. Créer un portefeuille vide
			const portfolio = Portfolio.createEmpty(userId);

			// 4. Calculer les positions à partir des ordres exécutés
			const stockPositions = new Map<
				string,
				{ quantity: number; totalCost: number; orders: any[] }
			>();

			for (const order of executedOrders) {
				const stockKey = order.stockId.value;

				if (!stockPositions.has(stockKey)) {
					stockPositions.set(stockKey, {
						quantity: 0,
						totalCost: 0,
						orders: [],
					});
				}

				const position = stockPositions.get(stockKey)!;
				position.orders.push(order);

				if (order.isBuyOrder()) {
					// Achat: ajouter à la quantité et au coût total
					position.quantity += order.quantity;
					position.totalCost += order.pricePerShare.amount * order.quantity;
				} else {
					// Vente: retirer de la quantité et ajuster le coût moyen
					const soldQuantity = Math.min(order.quantity, position.quantity);
					const averageCost =
						position.quantity > 0 ? position.totalCost / position.quantity : 0;

					position.quantity -= soldQuantity;
					position.totalCost -= averageCost * soldQuantity;
				}
			}

			// 5. Récupérer les informations actuelles des actions possédées
			const stockIds = Array.from(stockPositions.keys())
				.filter((key) => stockPositions.get(key)!.quantity > 0)
				.map((key) => StockId.fromNumber(parseInt(key)));

			if (stockIds.length > 0) {
				const stocks = await this.stockRepository.findByIds(stockIds);

				// 6. Construire les positions du portefeuille
				for (const stock of stocks) {
					const position = stockPositions.get(stock.id.value);
					if (position && position.quantity > 0) {
						const averagePrice = new Money(
							position.totalCost / position.quantity
						);

						portfolio.addPosition(
							stock.id,
							stock.symbol,
							stock.companyName,
							position.quantity,
							averagePrice
						);

						// Mettre à jour avec le prix actuel
						portfolio.updateStockPrice(stock.id, stock.currentPrice);
					}
				}
			}

			// 7. Formater le résultat
			const portfolioInfo = this.formatPortfolioInfo(portfolio);

			return {
				success: true,
				portfolio: portfolioInfo,
				message: `Portefeuille récupéré avec ${portfolio.positions.length} position(s)`,
				errors: [],
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Erreur inconnue";
			console.error(`[GetUserPortfolio] Erreur:`, error);

			return {
				success: false,
				portfolio: null,
				message: "Erreur lors de la récupération du portefeuille",
				errors: [errorMessage],
			};
		}
	}

	/**
	 * Formate le portefeuille pour l'interface utilisateur
	 */
	private formatPortfolioInfo(portfolio: Portfolio): PortfolioInfo {
		const totalGainLossPercentage =
			portfolio.totalValue.amount > 0
				? (portfolio.totalGainLoss.amount /
						(portfolio.totalValue.amount - portfolio.totalGainLoss.amount)) * 100 : 0;

		return {
			userId: portfolio.userId.value,
			positions: portfolio.positions.map((position) => ({
				stockId: position.stockId.value,
				stockSymbol: position.stockSymbol,
				companyName: position.companyName,
				quantity: position.quantity,
				averagePurchasePrice: {
					amount: position.averagePurchasePrice.amount,
					currency: position.averagePurchasePrice.currency,
					formatted: position.averagePurchasePrice.formatted,
				},
				currentPrice: {
					amount: position.currentPrice.amount,
					currency: position.currentPrice.currency,
					formatted: position.currentPrice.formatted,
				},
				totalValue: {
					amount: position.totalValue.amount,
					currency: position.totalValue.currency,
					formatted: position.totalValue.formatted,
				},
				gainLoss: {
					amount: position.gainLoss.amount,
					currency: position.gainLoss.currency,
					formatted: position.gainLoss.formatted,
				},
				gainLossPercentage: position.gainLossPercentage,
			})),
			totalValue: {
				amount: portfolio.totalValue.amount,
				currency: portfolio.totalValue.currency,
				formatted: portfolio.totalValue.formatted,
			},
			totalGainLoss: {
				amount: portfolio.totalGainLoss.amount,
				currency: portfolio.totalGainLoss.currency,
				formatted: portfolio.totalGainLoss.formatted,
			},
			totalGainLossPercentage,
			lastUpdated: portfolio.lastUpdated.toISOString(),
		};
	}
}
