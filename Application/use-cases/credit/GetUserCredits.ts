import { ICreditRepository } from "../../../Domain/repositories/ICreditRepository";
import { UserId } from "../../../Domain/value-objects/UserId";
import { Credit } from "../../../Domain/entities/Credit";

/**
 * Use Case : GetUserCredits
 * Récupère tous les crédits d'un utilisateur
 */
export class GetUserCredits {
	constructor(private creditRepository: ICreditRepository) {}

	async execute(input: GetUserCreditsInput): Promise<GetUserCreditsOutput> {
		const userId = UserId.fromNumber(input.userId);
		const credits = await this.creditRepository.findByUserId(userId);

		return {
			success: true,
			credits: credits.map((credit) => this.mapCreditToDTO(credit)),
		};
	}

	private mapCreditToDTO(credit: Credit) {
		return {
			id: credit.getId().getValue(),
			userId: parseInt(credit.getUserId().value),
			accountId: parseInt(credit.getAccountId().value),
			advisorId: parseInt(credit.getAdvisorId().value),
			principalAmount: credit.getPrincipalAmount().amount,
			annualInterestRate: credit.getAnnualInterestRate(),
			insuranceRate: credit.getInsuranceRate(),
			durationMonths: credit.getDurationMonths(),
			monthlyPayment: credit.getMonthlyPayment().amount,
			remainingBalance: credit.getRemainingBalance().amount,
			remainingMonths: credit.getRemainingMonths(),
			status: credit.getStatus(),
			createdAt: credit.getCreatedAt(),
			updatedAt: credit.getUpdatedAt(),
		};
	}
}

export interface GetUserCreditsInput {
	userId: number;
}

export interface GetUserCreditsOutput {
	success: boolean;
	credits: Array<{
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
		status: string;
		createdAt: Date;
		updatedAt: Date;
	}>;
}
