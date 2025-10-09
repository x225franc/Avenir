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
	amount: number;
	currency: string;
	description: string;
	status: string;
	createdAt: string;
}

/**
 * Service pour les opérations de transaction
 */
export const transactionService = {
	/**
	 * Effectuer un transfert d'argent
	 */
	async transfer(data: TransferMoneyDTO): Promise<ApiResponse<{ transactionId: string }>> {
		const response = await apiClient.post<ApiResponse<{ transactionId: string }>>(
			"/transactions/transfer",
			data
		);
		return response.data;
	},

	/**
	 * Récupérer l'historique des transactions d'un compte
	 */
	async getAccountTransactions(accountId: string): Promise<ApiResponse<Transaction[]>> {
		const response = await apiClient.get<ApiResponse<Transaction[]>>(
			`/transactions/account/${accountId}`
		);
		return response.data;
	},
};
