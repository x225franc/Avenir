/**
 * Value Object : InternalMessageId
 * Identifiant unique d'un message interne
 */
export class InternalMessageId {
	private readonly _value: number;

	private constructor(value: number) {
		if (value < 0) {
			throw new Error("InternalMessageId must be a non-negative number");
		}
		this._value = value;
	}

	get value(): number {
		return this._value;
	}

	public getValue(): number {
		return this._value;
	}

	public equals(other: InternalMessageId): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value.toString();
	}

	/**
	 * Crée un InternalMessageId à partir d'une valeur numérique
	 */
	public static fromNumber(value: number): InternalMessageId {
		return new InternalMessageId(value);
	}
}
