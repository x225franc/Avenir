/**
 * Value Object : TransactionId
 * Identifiant unique d'une transaction
 */
export class TransactionId {
	private readonly _value: string;

	private constructor(value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error("TransactionId cannot be empty");
		}
		this._value = value.trim();
	}

	get value(): string {
		return this._value;
	}

	public getValue(): string {
		return this._value;
	}

	public equals(other: TransactionId): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}

	/**
	 * Crée un TransactionId à partir d'une valeur
	 */
	public static create(value: string): TransactionId {
		return new TransactionId(value);
	}

	/**
	 * Génère un nouvel ID unique
	 */
	public static generate(): TransactionId {
		return new TransactionId(crypto.randomUUID());
	}
}
