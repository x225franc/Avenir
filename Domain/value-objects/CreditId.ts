/**
 * Value Object : CreditId
 * Identifiant unique d'un crédit
 */
export class CreditId {
	private readonly _value: number;

	constructor(value: number) {
		if (value <= 0) {
			throw new Error("CreditId must be a positive number");
		}
		this._value = value;
	}

	get value(): number {
		return this._value;
	}

	public getValue(): number {
		return this._value;
	}

	public equals(other: CreditId): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value.toString();
	}

	/**
	 * Crée un CreditId à partir d'une valeur numérique
	 */
	public static fromNumber(value: number): CreditId {
		return new CreditId(value);
	}
}
