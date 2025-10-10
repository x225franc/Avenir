import { v4 as uuidv4 } from "uuid";

export class UserId {
	private readonly _value: string;

	constructor(value: string) {
		if (!this.isValid(value)) {
			throw new Error(`Invalid UserId format: ${value}`);
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

	public equals(other: UserId): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}

	public static generate(): UserId {
		return new UserId(uuidv4());
	}

	public static fromString(value: string): UserId {
		return new UserId(value);
	}

	public static fromNumber(value: number): UserId {
		return new UserId(value.toString());
	}
}
