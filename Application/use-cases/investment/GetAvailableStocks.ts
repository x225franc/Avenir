import { IStockRepository } from "../../../Domain/repositories/IStockRepository";
import { IBankSettingsRepository } from "../../../Domain/repositories/IBankSettingsRepository";
import { Stock } from "../../../Domain/entities/Stock";
import { Money } from "../../../Domain/value-objects/Money";

export interface GetAvailableStocksResult {
	success: boolean;
	stocks: StockInfo[];
	message: string;
	errors: string[];
}

export interface StockInfo {
	id: string;
	symbol: string;
	companyName: string;
	currentPrice: {
		amount: number;
		currency: string;
		formatted: string;
	};
	isAvailable: boolean;
	fees: {
		amount: number;
		currency: string;
		formatted: string;
	};
}

/**
 * Use Case : Récupérer les actions disponibles
 *
 * Responsabilités:
 * - Récupérer toutes les actions disponibles à la négociation
 * - Formater les données pour l'interface utilisateur
 * - Inclure les informations sur les frais (1€ par transaction)
 */
export class GetAvailableStocks {
	constructor(
		private stockRepository: IStockRepository,
		private bankSettingsRepository: IBankSettingsRepository
	) {}

	async execute(
		includeUnavailable: boolean = false
	): Promise<GetAvailableStocksResult> {
		try {
			// Récupérer les frais d'investissement
			const transactionFee =
				await this.bankSettingsRepository.getInvestmentFee();

			// Récupérer les actions (disponibles uniquement par défaut)
			const stocks = await this.stockRepository.findAll(!includeUnavailable);

			// Formater les données pour l'interface
			const stocksInfo: StockInfo[] = stocks.map((stock) =>
				this.formatStockInfo(stock, transactionFee)
			);

			return {
				success: true,
				stocks: stocksInfo,
				message: `${stocksInfo.length} action(s) trouvée(s)`,
				errors: [],
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Erreur inconnue";
			console.error(`[GetAvailableStocks] Erreur:`, error);

			return {
				success: false,
				stocks: [],
				message: "Erreur lors de la récupération des actions",
				errors: [errorMessage],
			};
		}
	}

	/**
	 * Formate les informations d'une action pour l'interface utilisateur
	 */
	private formatStockInfo(stock: Stock, transactionFee: number): StockInfo {
		const fees = new Money(transactionFee, stock.currentPrice.currency);

		return {
			id: stock.id.value,
			symbol: stock.symbol,
			companyName: stock.companyName,
			currentPrice: {
				amount: stock.currentPrice.amount,
				currency: stock.currentPrice.currency,
				formatted: stock.currentPrice.formatted,
			},
			isAvailable: stock.isAvailable,
			fees: {
				amount: fees.amount,
				currency: fees.currency,
				formatted: fees.formatted,
			},
		};
	}
}
