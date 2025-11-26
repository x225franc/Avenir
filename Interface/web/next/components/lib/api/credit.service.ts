import apiClient from "./client";

export interface Credit {
	id: number;
	userId: number;
	accountId: number;
	advisorId: number;
	principalAmount: number;
	annualInterestRate: number;
	insuranceRate: number;
	durationMonths: number;
	monthlyPayment: number;
	remainingBalance: number;
	remainingMonths: number;
	status: "active" | "paid_off" | "defaulted";
	createdAt: string;
	updatedAt: string;
}

export interface GrantCreditRequest {
	userId: number;
	accountId: number;
	principalAmount: number;
	annualInterestRate: number;
	insuranceRate: number;
	durationMonths: number;
}

export interface CreditCalculation {
	totalAmount: number;
	totalInterest: number;
	totalInsurance: number;
	monthlyCost: number;
}

class CreditService {
	/**
	 * Octroyer un crédit (conseiller/directeur uniquement)
	 */
	async grantCredit(data: GrantCreditRequest) {
		const response = await apiClient.post("/credits/grant", data);
		return response.data;
	}

	/**
	 * Récupérer les crédits d'un utilisateur
	 */
	async getUserCredits(userId: number): Promise<{
		success: boolean;
		credits: Credit[];
	}> {
		const response = await apiClient.get(`/credits/user/${userId}`);
		return response.data;
	}

	/**
	 * Simuler un crédit (calcul des mensualités)
	 */
	async calculateCredit(
		principalAmount: number,
		annualInterestRate: number,
		insuranceRate: number,
		durationMonths: number
	): Promise<{
		success: boolean;
		totalAmount: number;
		totalInterest: number;
		totalInsurance: number;
		monthlyCost: number;
	}> {
		const response = await apiClient.get("/credits/calculate", {
			params: {
				principalAmount,
				annualInterestRate,
				insuranceRate,
				durationMonths,
			},
		});
		return response.data;
	}
}

export const creditService = new CreditService();
