/**
 * Service : CreditCalculationService
 * Calcule les mensualités d'un crédit à taux fixe avec mensualité constante
 */
export class CreditCalculationService {
	/**
	 * Calcule la mensualité constante d'un crédit
	 * Formule : M = (C × t) / (1 - (1 + t)^(-n))
	 * Où :
	 * - M = mensualité
	 * - C = capital emprunté
	 * - t = taux mensuel (taux annuel / 12)
	 * - n = nombre de mensualités (durée en mois)
	 *
	 * L'assurance est ajoutée à la mensualité
	 */
	calculateMonthlyPayment(
		principalAmount: number,
		annualInterestRate: number,
		insuranceRate: number,
		durationMonths: number
	): number {
		// Calcul de la mensualité sans assurance
		const monthlyRate = annualInterestRate / 12;

		let monthlyPaymentWithoutInsurance: number;

		if (monthlyRate === 0) {
			// Si pas d'intérêt, mensualité = capital / durée
			monthlyPaymentWithoutInsurance = principalAmount / durationMonths;
		} else {
			// Formule de mensualité constante
			monthlyPaymentWithoutInsurance =
				(principalAmount * monthlyRate) /
				(1 - Math.pow(1 + monthlyRate, -durationMonths));
		}

		// Calcul de l'assurance mensuelle (calculée sur le capital total)
		const monthlyInsurance = (principalAmount * insuranceRate) / durationMonths;

		// Mensualité totale = mensualité + assurance
		const totalMonthlyPayment = monthlyPaymentWithoutInsurance + monthlyInsurance;

		// Arrondir à 2 décimales
		return Math.round(totalMonthlyPayment * 100) / 100;
	}

	/**
	 * Calcule le coût total du crédit (intérêts + assurance)
	 */
	calculateTotalCost(
		principalAmount: number,
		annualInterestRate: number,
		insuranceRate: number,
		durationMonths: number
	): {
		totalAmount: number;
		totalInterest: number;
		totalInsurance: number;
		monthlyCost: number;
	} {
		const monthlyPayment = this.calculateMonthlyPayment(
			principalAmount,
			annualInterestRate,
			insuranceRate,
			durationMonths
		);

		const totalAmount = monthlyPayment * durationMonths;
		const totalInsurance = principalAmount * insuranceRate;
		const totalInterest = totalAmount - principalAmount - totalInsurance;

		return {
			totalAmount,
			totalInterest,
			totalInsurance,
			monthlyCost: monthlyPayment,
		};
	}

	/**
	 * Vérifie si le client peut se permettre le crédit
	 * (règle des 33% d'endettement maximum)
	 */
	canAffordCredit(
		monthlyPayment: number,
		monthlyIncome: number,
		existingMonthlyDebts: number = 0
	): boolean {
		const totalMonthlyDebts = monthlyPayment + existingMonthlyDebts;
		const debtRatio = totalMonthlyDebts / monthlyIncome;

		return debtRatio <= 0.33; // 33% maximum
	}
}
