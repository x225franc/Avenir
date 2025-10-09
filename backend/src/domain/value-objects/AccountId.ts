import { v4 as uuidv4 } from "uuid";

export class AccountId {
	private readonly _value: string;

	constructor(value: string) {
		if (!this.isValid(value)) {
			throw new Error(`Invalid AccountId format: ${value}`);
		}
		this._value = value;
	}

	get value(): string {
		return this._value;
	}

	private isValid(id: string): boolean {
		// Vérifie que c'est un UUID v4 valide ou un ID numérique
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		const numericRegex = /^\d+$/;
		return uuidRegex.test(id) || numericRegex.test(id);
	}

	public equals(other: AccountId): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}

	public static generate(): AccountId {
		return new AccountId(uuidv4());
	}

	public static fromString(value: string): AccountId {
		return new AccountId(value);
	}

	public static fromNumber(value: number): AccountId {
		return new AccountId(value.toString());
	}
}
