import apiClient, { ApiResponse } from "./client";
import {
	TransferFormData,
	TransferResponse,
	Transaction,
} from "./transfer.types";

export const transferService = {
	/**
	 * Effectue un transfert entre deux comptes
	 */
	create: async (data: TransferFormData): Promise<TransferResponse> => {
		const response = await apiClient.post<TransferResponse>("/transfers", data);
		return response.data;
	},

	/**
	 * Effectue un transfert vers un IBAN externe
	 */
	createToIban: async (data: {
		sourceAccountId: string;
		destinationIban: string;
		amount: number;
		currency: string;
		description?: string;
	}): Promise<TransferResponse> => {
		const response = await apiClient.post<TransferResponse>(
			"/transfers/iban",
			data
		);
		return response.data;
	},

	/**
	 * Recherche les informations d'un compte par IBAN
	 */
	getAccountByIban: async (
		iban: string
	): Promise<
		ApiResponse<{
			accountId: string;
			ownerName: string;
			bankName: string;
			isValid: boolean;
		}>
	> => {
		const response = await apiClient.get<
			ApiResponse<{
				accountId: string;
				ownerName: string;
				bankName: string;
				isValid: boolean;
			}>
		>(`/transfers/iban/lookup/${encodeURIComponent(iban)}`);
		return response.data;
	},

	/**
	 * Récupère l'historique des transactions d'un compte
	 */
	getByAccountId: async (accountId: string): Promise<Transaction[]> => {
		const response = await apiClient.get<ApiResponse<Transaction[]>>(
			`/transfers/account/${accountId}`
		);
		return response.data.data || [];
	},

	/**
	 * Récupère toutes les transactions de l'utilisateur connecté
	 */
	getAll: async (): Promise<Transaction[]> => {
		const response = await apiClient.get<ApiResponse<Transaction[]>>(
			"/transfers"
		);
		return response.data.data || [];
	},
};
