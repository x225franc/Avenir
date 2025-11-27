import apiClient, { ApiResponse } from "./client";

/**
 * DTOs pour les transactions
 */
export interface TransferMoneyDTO {
	sourceAccountId: string;
	destinationIBAN: string;
	amount: number;
	currency: string;
	description?: string;
}

export interface Transaction {
	id: string;
	sourceAccountId: string;
	destinationAccountId: string;
	destinationIBAN?: string;
	amount: number;
	currency: string;
	description: string;
	status: "pending" | "completed" | "failed" | "cancelled";
	createdAt: string;
	updatedAt?: string;
	processedBy?: string;
	processedAt?: string;
	// Informations utilisateur pour l'affichage
	sourceAccount?: {
		id: string;
		accountNumber: string;
		iban: string;
		accountType: string;
		user: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
		};
	};
	destinationAccount?: {
		id: string;
		accountNumber: string;
		iban: string;
		accountType: string;
		user?: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
		};
	};
}

/**
 * Service pour les opérations de transaction
 */
export const transactionService = {
	/**
	 * Effectuer un transfert d'argent
	 */
	async transfer(
		data: TransferMoneyDTO
	): Promise<ApiResponse<{ transactionId: string }>> {
		const response = await apiClient.post<
			ApiResponse<{ transactionId: string }>
		>("/transactions/transfer", data);
		return response.data;
	},

	/**
	 * Récupérer l'historique des transactions d'un compte
	 */
	async getAccountTransactions(
		accountId: string
	): Promise<ApiResponse<Transaction[]>> {
		const response = await apiClient.get<ApiResponse<Transaction[]>>(
			`/transactions/account/${accountId}`
		);
		return response.data;
	},

	/**
	 * Récupérer toutes les transactions PENDING (advisor uniquement)
	 */
	async getPendingTransactions(): Promise<ApiResponse<Transaction[]>> {
		const response = await apiClient.get<ApiResponse<Transaction[]>>(
			"/advisor/transactions/pending"
		);
		return response.data;
	},

	/**
	 * Approuver une transaction PENDING (advisor uniquement)
	 */
	async approveTransaction(
		transactionId: string
	): Promise<ApiResponse<Transaction>> {
		const response = await apiClient.patch<ApiResponse<Transaction>>(
			`/advisor/transactions/${transactionId}/approve`
		);
		return response.data;
	},

	/**
	 * Rejeter une transaction PENDING (advisor uniquement)
	 */
	async rejectTransaction(
		transactionId: string,
		reason?: string
	): Promise<ApiResponse<Transaction>> {
		const response = await apiClient.patch<ApiResponse<Transaction>>(
			`/advisor/transactions/${transactionId}/reject`,
			{ reason }
		);
		return response.data;
	},

	/**
	 * Récupérer toutes les transactions pour monitoring (advisor uniquement)
	 */
	async getAllTransactions(): Promise<ApiResponse<Transaction[]>> {
		const response = await apiClient.get<ApiResponse<Transaction[]>>(
			"/advisor/transactions"
		);
		return response.data;
	},
};
