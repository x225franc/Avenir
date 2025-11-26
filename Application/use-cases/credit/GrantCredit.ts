import { Credit } from "../../../Domain/entities/Credit";
import { CreditId } from "../../../Domain/value-objects/CreditId";
import { UserId } from "../../../Domain/value-objects/UserId";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { Money } from "../../../Domain/value-objects/Money";
import { ICreditRepository } from "../../../Domain/repositories/ICreditRepository";
import { IAccountRepository } from "../../../Domain/repositories/IAccountRepository";
import { IUserRepository } from "../../../Domain/repositories/IUserRepository";
import { CreditCalculationService } from "../../services/CreditCalculationService";

/**
 * Use Case : GrantCredit
 * Permet à un conseiller d'octroyer un crédit à un client
 */
export class GrantCredit {
	constructor(
		private creditRepository: ICreditRepository,
		private accountRepository: IAccountRepository,
		private userRepository: IUserRepository,
		private calculationService: CreditCalculationService
	) {}

	async execute(input: GrantCreditInput): Promise<GrantCreditOutput> {
		// 1. Vérifier que le conseiller existe et a le bon rôle
		const advisor = await this.userRepository.findById(
			UserId.fromNumber(input.advisorId)
		);
		if (!advisor) {
			throw new Error("Advisor not found");
		}
		if (advisor.role !== "advisor" && advisor.role !== "director") {
			throw new Error("Only advisors and directors can grant credits");
		}

		// 2. Vérifier que le client existe
		const user = await this.userRepository.findById(
			UserId.fromNumber(input.userId)
		);
		if (!user) {
			throw new Error("User not found");
		}

		// 3. Vérifier que le compte existe et appartient au client
		const account = await this.accountRepository.findById(
			AccountId.fromNumber(input.accountId)
		);
		if (!account) {
			throw new Error("Account not found");
		}
		if (account.userId.value !== input.userId.toString()) {
			throw new Error("Account does not belong to user");
		}

		// 4. Calculer la mensualité
		const monthlyPayment = this.calculationService.calculateMonthlyPayment(
			input.principalAmount,
			input.annualInterestRate,
			input.insuranceRate,
			input.durationMonths
		);

		// 5. Créer le crédit
		const creditId = new CreditId(Date.now()); // Temporaire, sera remplacé par l'ID de la base
		const credit = new Credit(
			creditId,
			UserId.fromNumber(input.userId),
			AccountId.fromNumber(input.accountId),
			UserId.fromNumber(input.advisorId),
			new Money(input.principalAmount),
			input.annualInterestRate,
			input.insuranceRate,
			input.durationMonths,
			new Money(monthlyPayment),
			new Money(input.principalAmount), // Le capital restant = capital initial au début
			"active",
			new Date(),
			new Date()
		);

		// 6. Sauvegarder le crédit
		await this.creditRepository.save(credit);

		// 7. Créditer le compte du client
		account.credit(new Money(input.principalAmount));
		await this.accountRepository.save(account);

		// 8. Calculer les informations totales
		const totalCost = this.calculationService.calculateTotalCost(
			input.principalAmount,
			input.annualInterestRate,
			input.insuranceRate,
			input.durationMonths
		);

		return {
			success: true,
			creditId: credit.getId().getValue(),
			monthlyPayment,
			totalCost: totalCost.totalAmount,
			totalInterest: totalCost.totalInterest,
			totalInsurance: totalCost.totalInsurance,
			message: "Credit granted successfully",
		};
	}
}

export interface GrantCreditInput {
	userId: number;
	accountId: number;
	advisorId: number;
	principalAmount: number;
	annualInterestRate: number; // Ex: 0.05 pour 5%
	insuranceRate: number; // Ex: 0.003 pour 0.3%
	durationMonths: number;
}

export interface GrantCreditOutput {
	success: boolean;
	creditId: number;
	monthlyPayment: number;
	totalCost: number;
	totalInterest: number;
	totalInsurance: number;
	message: string;
}
