/**
 * Value Object : Money (Argent)
 * Représente une somme d'argent avec la devise
 */
export class Money {
	private readonly _amount: number;
	private readonly _currency: string;

	constructor(amount: number, currency: string = "EUR") {
		if (amount < 0) {
			throw new Error("Amount cannot be negative");
		}

		// Arrondir à 2 décimales pour éviter les problèmes de précision
		this._amount = Math.round(amount * 100) / 100;
		this._currency = currency;
	}

	get amount(): number {
		return this._amount;
	}

	get currency(): string {
		return this._currency;
	}

	/**
	 * Formate le montant en chaîne de caractères
	 * Ex: 1234.56 EUR => "1 234,56 €"
	 */
	get formatted(): string {
		const formatted = new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: this._currency,
		}).format(this._amount);

		return formatted;
	}

	public add(other: Money): Money {
		this.assertSameCurrency(other);
		return new Money(this._amount + other._amount, this._currency);
	}

	public subtract(other: Money): Money {
		this.assertSameCurrency(other);
		const result = this._amount - other._amount;

		if (result < 0) {
			throw new Error("Resulting amount cannot be negative");
		}

		return new Money(result, this._currency);
	}

	public multiply(factor: number): Money {
		if (factor < 0) {
			throw new Error("Factor cannot be negative");
		}
		return new Money(this._amount * factor, this._currency);
	}

	public divide(divisor: number): Money {
		if (divisor <= 0) {
			throw new Error("Divisor must be greater than zero");
		}
		return new Money(this._amount / divisor, this._currency);
	}

	public isGreaterThan(other: Money): boolean {
		this.assertSameCurrency(other);
		return this._amount > other._amount;
	}

	public isGreaterThanOrEqual(other: Money): boolean {
		this.assertSameCurrency(other);
		return this._amount >= other._amount;
	}

	public isLessThan(other: Money): boolean {
		this.assertSameCurrency(other);
		return this._amount < other._amount;
	}

	public isLessThanOrEqual(other: Money): boolean {
		this.assertSameCurrency(other);
		return this._amount <= other._amount;
	}

	public equals(other: Money): boolean {
		return this._amount === other._amount && this._currency === other._currency;
	}

	public isZero(): boolean {
		return this._amount === 0;
	}

	public isPositive(): boolean {
		return this._amount > 0;
	}

	private assertSameCurrency(other: Money): void {
		if (this._currency !== other._currency) {
			throw new Error(
				`Cannot operate on different currencies: ${this._currency} and ${other._currency}`
			);
		}
	}

	public toString(): string {
		return `${this._amount} ${this._currency}`;
	}

	public toJSON(): any {
		return {
			amount: this._amount,
			currency: this._currency,
			formatted: this.formatted,
		};
	}

	public static zero(currency: string = "EUR"): Money {
		return new Money(0, currency);
	}

	public static fromCents(cents: number, currency: string = "EUR"): Money {
		return new Money(cents / 100, currency);
	}
}
