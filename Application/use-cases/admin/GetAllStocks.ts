import { IStockRepository } from "@domain/repositories/IStockRepository";
import { IInvestmentOrderRepository } from "@domain/repositories/IInvestmentOrderRepository";
import { StockId } from "@domain/value-objects/StockId";

/**
 * Use Case: Récupérer toutes les actions avec le nombre d'actions détenues
 * Accessible au directeur et aux clients (pour affichage)
 */
export class GetAllStocks {
	constructor(
		private readonly stockRepository: IStockRepository,
		private readonly investmentOrderRepository: IInvestmentOrderRepository
	) {}

	async execute(availableOnly: boolean = false): Promise<{
		success: boolean;
		data?: any[];
		message?: string;
	}> {
		try {
			const stocks = await this.stockRepository.findAll(availableOnly);

			// Pour chaque action, calculer le nombre net d'actions détenues par les utilisateurs
			const stocksWithHoldings = await Promise.all(
				stocks.map(async (stock) => {
					const holdingsCount =
						await this.investmentOrderRepository.countNetHoldingsByStockId(
							stock.id
						);

					return {
						id: stock.id.value,
						symbol: stock.symbol,
						companyName: stock.companyName,
						currentPrice: stock.currentPrice.amount,
						currency: stock.currentPrice.currency,
						isAvailable: stock.isAvailable,
						holdingsCount, // Nombre d'actions détenues par tous les utilisateurs
						createdAt: stock.createdAt,
						updatedAt: stock.updatedAt,
					};
				})
			);

			return {
				success: true,
				data: stocksWithHoldings,
			};
		} catch (error: any) {
			return {
				success: false,
				message:
					error.message || "Erreur lors de la récupération des actions",
			};
		}
	}
}
