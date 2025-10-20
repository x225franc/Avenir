import apiClient, { ApiResponse } from "./client";

export interface OperationDTO {
	accountId: string;
	amount: number;
	description?: string;
}

export interface OperationResponse {
	success: boolean;
	message: string;
	data?: {
		transactionId: string;
		fromAccountId: string | null;
		toAccountId: string | null;
		amount: number;
		currency: string;
		type: string;
		status: string;
		description: string | null;
		createdAt: Date;
	};
}

export const operationService = {
	/**
	 * Déposer de l'argent sur un compte
	 */
	deposit: async (data: OperationDTO): Promise<OperationResponse> => {
		const response = await apiClient.post<OperationResponse>(
			"/operations/deposit",
			data
		);
		return response.data;
	},

	/**
	 * Retirer de l'argent d'un compte
	 */
	withdraw: async (data: OperationDTO): Promise<OperationResponse> => {
		const response = await apiClient.post<OperationResponse>(
			"/operations/withdraw",
			data
		);
		return response.data;
	},
};
