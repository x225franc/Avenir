import apiClient, { ApiResponse } from "./client";
import { cacheManager, CacheKeys, CacheTTL } from "../cache";

/**
 * DTOs pour les comptes
 */
export interface CreateAccountDTO {
	accountName: string;
	accountType: "checking" | "savings" | "investment";
	initialDeposit?: number;
	currency?: string;
}

export interface Account {
	id: string;
	iban: string;
	name: string;
	type: "checking" | "savings" | "investment";
	balance: number;
	currency: string;
	interestRate?: number;
	isActive: boolean;
	createdAt: string;
}

/**
 * Service pour les opérations sur les comptes
 */
export const accountService = {
	/**
	 * Créer un nouveau compte bancaire
	 */
	async create(
		data: CreateAccountDTO
	): Promise<ApiResponse<{ accountId: string; iban: string }>> {
		const response = await apiClient.post<
			ApiResponse<{ accountId: string; iban: string }>
		>("/accounts", data);
		// Invalider le cache des comptes
		cacheManager.invalidatePattern(`${CacheKeys.ACCOUNTS}:.*`);
		return response.data;
	},

	/**
	 * Récupérer tous les comptes de l'utilisateur
	 */
	async getAll(): Promise<ApiResponse<Account[]>> {
		const cacheKey = `${CacheKeys.ACCOUNTS}:list`;
		const cached = cacheManager.get<ApiResponse<Account[]>>(cacheKey);
		if (cached) return cached;

		const response = await apiClient.get<ApiResponse<Account[]>>("/accounts");
		cacheManager.set(cacheKey, response.data, CacheTTL.MEDIUM);
		return response.data;
	},

	/**
	 * Récupérer un compte spécifique
	 */
	async getById(accountId: string): Promise<ApiResponse<Account>> {
		const response = await apiClient.get<ApiResponse<Account>>(
			`/accounts/${accountId}`
		);
		return response.data;
	},

	/**
	 * Mettre à jour un compte
	 */
	async update(
		accountId: string,
		data: Partial<CreateAccountDTO>
	): Promise<ApiResponse<Account>> {
		const response = await apiClient.put<ApiResponse<Account>>(
			`/accounts/${accountId}`,
			data
		);
		return response.data;
	},

	/**
	 * Supprimer un compte
	 */
	async delete(accountId: string): Promise<ApiResponse> {
		try {
			const response = await apiClient.delete<ApiResponse>(
				`/accounts/${accountId}`
			);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 400) {
				return {
					success: false,
					error: error.response.data?.error || "Erreur lors de la suppression",
				};
			}
			throw error;
		}
	},

	/**
	 * Récupérer les comptes d'un utilisateur spécifique (conseiller/directeur uniquement)
	 */
	async getUserAccounts(userId: string): Promise<ApiResponse<Account[]>> {
		const response = await apiClient.get<ApiResponse<Account[]>>(
			`/accounts/user/${userId}`
		);
		return response.data;
	},
};
