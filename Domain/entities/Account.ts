import { AccountId } from "../value-objects/AccountId";
import { UserId } from "../value-objects/UserId";
import { IBAN } from "../value-objects/IBAN";
import { Money } from "../value-objects/Money";

export enum AccountType {
	CHECKING = "checking", // Compte courant
	SAVINGS = "savings", // Compte d'épargne
	INVESTMENT = "investment", // Compte d'investissement
}

export interface AccountProps {
	id: AccountId;
	userId: UserId;
	iban: IBAN;
	accountName: string;
	accountType: AccountType;
	balance: Money;
	interestRate?: number; // Taux d'intérêt pour les comptes d'épargne (en %)
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class Account {
	private constructor(private props: AccountProps) {}

	public static create(
		props: Omit<
			AccountProps,
			"id" | "iban" | "balance" | "isActive" | "createdAt" | "updatedAt"
		>
	): Account {
		const now = new Date();
		return new Account({
			...props,
			id: new AccountId("0"),
			iban: IBAN.generate(),
			balance: Money.zero(),
			isActive: true,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static fromPersistence(props: AccountProps): Account {
		return new Account(props);
	}

	// Getters
	get id(): AccountId {
		return this.props.id;
	}

	get userId(): UserId {
		return this.props.userId;
	}

	get iban(): IBAN {
		return this.props.iban;
	}

	get accountName(): string {
		return this.props.accountName;
	}

	get accountType(): AccountType {
		return this.props.accountType;
	}

	get balance(): Money {
		return this.props.balance;
	}

	get interestRate(): number | undefined {
		return this.props.interestRate;
	}

	get isActive(): boolean {
		return this.props.isActive;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	public rename(newName: string): void {
		if (!newName || newName.trim().length === 0) {
			throw new Error("Account name cannot be empty");
		}

		this.props.accountName = newName.trim();
		this.props.updatedAt = new Date();
	}

	public deactivate(): void {
		if (!this.props.isActive) {
			throw new Error("Account is already deactivated");
		}

		this.props.isActive = false;
		this.props.updatedAt = new Date();
	}

	public activate(): void {
		if (this.props.isActive) {
			throw new Error("Account is already active");
		}

		this.props.isActive = true;
		this.props.updatedAt = new Date();
	}

	public credit(amount: Money): void {
		if (!this.props.isActive) {
			throw new Error("Cannot credit an inactive account");
		}

		this.props.balance = this.props.balance.add(amount);
		this.props.updatedAt = new Date();
	}

	public debit(amount: Money): void {
		if (!this.props.isActive) {
			throw new Error("Cannot debit an inactive account");
		}

		if (this.props.balance.isLessThan(amount)) {
			throw new Error("Insufficient balance");
		}

		this.props.balance = this.props.balance.subtract(amount);
		this.props.updatedAt = new Date();
	}

	public hasEnoughBalance(amount: Money): boolean {
		return this.props.balance.isGreaterThanOrEqual(amount);
	}

	public updateInterestRate(newRate: number): void {
		if (this.props.accountType !== AccountType.SAVINGS) {
			throw new Error("Only savings accounts can have an interest rate");
		}

		if (newRate < 0 || newRate > 100) {
			throw new Error("Interest rate must be between 0 and 100");
		}

		this.props.interestRate = newRate;
		this.props.updatedAt = new Date();
	}

	public updateName(newName: string): void {
		if (!newName || newName.trim().length === 0) {
			throw new Error("Account name cannot be empty");
		}

		if (newName.trim().length < 3) {
			throw new Error("Account name must be at least 3 characters");
		}

		if (newName.trim().length > 50) {
			throw new Error("Account name cannot exceed 50 characters");
		}

		this.props.accountName = newName.trim();
		this.props.updatedAt = new Date();
	}

	public applyInterest(): void {
		if (this.props.accountType !== AccountType.SAVINGS) {
			throw new Error("Only savings accounts earn interest");
		}

		if (!this.props.interestRate || this.props.interestRate === 0) {
			return;
		}

		// Calcul des intérêts journaliers
		// Taux annuel / 365 jours * solde
		const dailyRate = this.props.interestRate / 365 / 100;
		const interest = this.props.balance.multiply(dailyRate);

		this.props.balance = this.props.balance.add(interest);
		this.props.updatedAt = new Date();
	}

	public isSavingsAccount(): boolean {
		return this.props.accountType === AccountType.SAVINGS;
	}

	public isCheckingAccount(): boolean {
		return this.props.accountType === AccountType.CHECKING;
	}

	public isInvestmentAccount(): boolean {
		return this.props.accountType === AccountType.INVESTMENT;
	}

	public canBeDeleted(): boolean {
		// Un compte ne peut être supprimé que s'il est vide
		return this.props.balance.isZero();
	}

	public toJSON(): any {
		return {
			id: this.props.id.value,
			userId: this.props.userId.value,
			iban: this.props.iban.formatted,
			accountName: this.props.accountName,
			accountType: this.props.accountType,
			balance: this.props.balance.toJSON(),
			interestRate: this.props.interestRate,
			isActive: this.props.isActive,
			createdAt: this.props.createdAt,
			updatedAt: this.props.updatedAt,
		};
	}
}
