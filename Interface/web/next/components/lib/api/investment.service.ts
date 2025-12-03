import apiClient from "./client";
import { cacheManager, CacheKeys, CacheTTL } from "../cache";

/**
 * Types pour l'investissement
 */
export interface Stock {
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

export interface InvestmentOrder {
	id: string;
	userId: string;
	accountId: string;
	stockId: string;
	stockSymbol?: string;
	companyName?: string;
	orderType: "buy" | "sell";
	quantity: number;
	pricePerShare: {
		amount: number;
		currency: string;
		formatted: string;
	};
	totalAmount: {
		amount: number;
		currency: string;
		formatted: string;
	};
	fees: {
		amount: number;
		currency: string;
		formatted: string;
	};
	status: "pending" | "executed" | "cancelled";
	executedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Portfolio {
	userId: string;
	positions: Position[];
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

export interface Position {
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

export interface PlaceOrderRequest {
	accountId: string;
	stockId: string;
	orderType: "buy" | "sell";
	quantity: number;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message: string;
	errors?: string[];
}

/**
 * Service pour les opérations d'investissement
 */
export class InvestmentService {
	/**
	 * Récupère toutes les actions disponibles
	 */
	async getAvailableStocks(
		includeUnavailable = false
	): Promise<ApiResponse<Stock[]>> {
		const cacheKey = `${CacheKeys.STOCKS}:available:${includeUnavailable}`;
		const cached = cacheManager.get<ApiResponse<Stock[]>>(cacheKey);
		if (cached) return cached;

		const response = await apiClient.get<ApiResponse<Stock[]>>(
			`/investment/stocks?includeUnavailable=${includeUnavailable}`
		);
		cacheManager.set(cacheKey, response.data, CacheTTL.SHORT);
		return response.data;
	}

	/**
	 * Place un ordre d'investissement
	 */
	async placeOrder(
		order: PlaceOrderRequest
	): Promise<ApiResponse<{ orderId: string }>> {
		const response = await apiClient.post<ApiResponse<{ orderId: string }>>(
			"/investment/orders",
			order
		);
		// Invalider les caches après mutation
		cacheManager.invalidatePattern(`${CacheKeys.PORTFOLIO}:.*`);
		cacheManager.invalidatePattern(`${CacheKeys.STOCKS}:.*`);
		return response.data;
	}

	/**
	 * Annule un ordre d'investissement
	 */
	async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
		const response = await apiClient.delete<ApiResponse<void>>(
			`/investment/orders/${orderId}`
		);
		return response.data;
	}

	/**
	 * Récupère l'historique des ordres
	 */
	async getOrderHistory(): Promise<ApiResponse<InvestmentOrder[]>> {
		const response = await apiClient.get<ApiResponse<InvestmentOrder[]>>(
			"/investment/orders"
		);
		return response.data;
	}

	/**
	 * Récupère le portefeuille de l'utilisateur
	 */
	async getPortfolio(): Promise<ApiResponse<Portfolio>> {
		const cacheKey = `${CacheKeys.PORTFOLIO}:user`;
		const cached = cacheManager.get<ApiResponse<Portfolio>>(cacheKey);
		if (cached) return cached;

		const response = await apiClient.get<ApiResponse<Portfolio>>(
			"/investment/portfolio"
		);
		cacheManager.set(cacheKey, response.data, CacheTTL.MEDIUM);
		return response.data;
	}

	/**
	 * Récupère les frais d'investissement actuels
	 */
	async getInvestmentFee(): Promise<ApiResponse<{ fee: number }>> {
		const response = await apiClient.get<ApiResponse<{ fee: number }>>(
			"/investment/fee"
		);
		return response.data;
	}
}

// Export d'une instance singleton
export const investmentService = new InvestmentService();
