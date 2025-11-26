import { CreditId } from "../value-objects/CreditId";
import { UserId } from "../value-objects/UserId";
import { AccountId } from "../value-objects/AccountId";
import { Money } from "../value-objects/Money";

/**
 * Entity : Credit
 * Représente un crédit accordé par un conseiller à un client
 */
export class Credit {
	constructor(
		private id: CreditId,
		private userId: UserId,
		private accountId: AccountId,
		private advisorId: UserId,
		private principalAmount: Money,
		private annualInterestRate: number, // Taux annuel (ex: 0.05 pour 5%)
		private insuranceRate: number, // Taux d'assurance (ex: 0.003 pour 0.3%)
		private durationMonths: number,
		private monthlyPayment: Money,
		private remainingBalance: Money,
		private status: "active" | "paid_off" | "defaulted",
		private createdAt: Date,
		private updatedAt: Date
	) {
		this.validate();
	}

	private validate(): void {
		if (this.annualInterestRate < 0 || this.annualInterestRate > 1) {
			throw new Error("Annual interest rate must be between 0 and 1");
		}
		if (this.insuranceRate < 0 || this.insuranceRate > 1) {
			throw new Error("Insurance rate must be between 0 and 1");
		}
		if (this.durationMonths <= 0) {
			throw new Error("Duration must be positive");
		}
		if (this.principalAmount.amount <= 0) {
			throw new Error("Principal amount must be positive");
		}
		if (this.remainingBalance.amount < 0) {
			throw new Error("Remaining balance cannot be negative");
		}
	}

	// Getters
	getId(): CreditId {
		return this.id;
	}

	getUserId(): UserId {
		return this.userId;
	}

	getAccountId(): AccountId {
		return this.accountId;
	}

	getAdvisorId(): UserId {
		return this.advisorId;
	}

	getPrincipalAmount(): Money {
		return this.principalAmount;
	}

	getAnnualInterestRate(): number {
		return this.annualInterestRate;
	}

	getInsuranceRate(): number {
		return this.insuranceRate;
	}

	getDurationMonths(): number {
		return this.durationMonths;
	}

	getMonthlyPayment(): Money {
		return this.monthlyPayment;
	}

	getRemainingBalance(): Money {
		return this.remainingBalance;
	}

	getStatus(): "active" | "paid_off" | "defaulted" {
		return this.status;
	}

	getCreatedAt(): Date {
		return this.createdAt;
	}

	getUpdatedAt(): Date {
		return this.updatedAt;
	}

	// Méthodes métier
	processMonthlyPayment(): void {
		if (this.status !== "active") {
			throw new Error("Cannot process payment for non-active credit");
		}

		const monthlyInterest = this.calculateMonthlyInterest();
		const principalPayment = this.monthlyPayment.amount - monthlyInterest;

		const newBalance = this.remainingBalance.amount - principalPayment;

		if (newBalance <= 0) {
			this.remainingBalance = new Money(0, this.remainingBalance.currency);
			this.status = "paid_off";
		} else {
			this.remainingBalance = new Money(
				newBalance,
				this.remainingBalance.currency
			);
		}

		this.updatedAt = new Date();
	}

	calculateMonthlyInterest(): number {
		const monthlyRate = this.annualInterestRate / 12;
		return this.remainingBalance.amount * monthlyRate;
	}

	markAsDefaulted(): void {
		this.status = "defaulted";
		this.updatedAt = new Date();
	}

	isPaidOff(): boolean {
		return this.status === "paid_off";
	}

	isActive(): boolean {
		return this.status === "active";
	}

	getRemainingMonths(): number {
		if (this.status === "paid_off") return 0;

		const monthlyRate = this.annualInterestRate / 12;
		if (monthlyRate === 0) {
			return Math.ceil(
				this.remainingBalance.amount / this.monthlyPayment.amount
			);
		}

		// Formule pour calculer le nombre de mensualités restantes
		const remainingMonths = Math.ceil(
			Math.log(
				this.monthlyPayment.amount /
					(this.monthlyPayment.amount -
						this.remainingBalance.amount * monthlyRate)
			) / Math.log(1 + monthlyRate)
		);

		return remainingMonths;
	}
}
