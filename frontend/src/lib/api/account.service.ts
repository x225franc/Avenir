import apiClient, { ApiResponse } from "./client";

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
	async create(data: CreateAccountDTO): Promise<ApiResponse<{ accountId: string; iban: string }>> {
		const response = await apiClient.post<ApiResponse<{ accountId: string; iban: string }>>(
			"/accounts",
			data
		);
		return response.data;
	},

	/**
	 * Récupérer tous les comptes de l'utilisateur
	 */
	async getAll(): Promise<ApiResponse<Account[]>> {
		const response = await apiClient.get<ApiResponse<Account[]>>("/accounts");
		return response.data;
	},

	/**
	 * Récupérer un compte spécifique
	 */
	async getById(accountId: string): Promise<ApiResponse<Account>> {
		const response = await apiClient.get<ApiResponse<Account>>(`/accounts/${accountId}`);
		return response.data;
	},

	/**
	 * Supprimer un compte
	 */
	async delete(accountId: string): Promise<ApiResponse> {
		const response = await apiClient.delete<ApiResponse>(`/accounts/${accountId}`);
		return response.data;
	},
};
