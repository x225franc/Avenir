/**
 * Value Object : MessageId
 * Identifiant unique d'un message
 */
export class MessageId {
	private readonly _value: number;

	private constructor(value: number) {
		if (value <= 0) {
			throw new Error("MessageId must be greater than 0");
		}
		this._value = value;
	}

	get value(): number {
		return this._value;
	}

	public getValue(): number {
		return this._value;
	}

	public equals(other: MessageId): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value.toString();
	}

	/**
	 * Crée un MessageId à partir d'une valeur numérique
	 */
	public static create(id: number): MessageId {
		return new MessageId(id);
	}
}
