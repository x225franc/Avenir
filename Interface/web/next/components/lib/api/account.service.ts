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
	 * Mettre à jour un compte
	 */
	async update(accountId: string, data: Partial<CreateAccountDTO>): Promise<ApiResponse<Account>> {
		const response = await apiClient.put<ApiResponse<Account>>(`/accounts/${accountId}`, data);
		return response.data;
	},

	/**
	 * Supprimer un compte
	 */
	async delete(accountId: string): Promise<ApiResponse> {
		try {
			const response = await apiClient.delete<ApiResponse>(`/accounts/${accountId}`);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 400) {
				return {
					success: false,
					error: error.response.data?.error || "Erreur lors de la suppression"
				};
			}
			throw error;
		}
	},
};
