import { randomUUID } from "crypto";

/**
 * Value Object : StockId
 * Identifiant unique pour les actions financières
 */
export class StockId {
	private readonly _value: string;

	constructor(value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error("StockId cannot be empty");
		}

		// Validation basique UUID ou format numérique
		if (!this.isValidFormat(value.trim())) {
			throw new Error("StockId must be a valid UUID or numeric ID");
		}

		this._value = value.trim();
	}

	get value(): string {
		return this._value;
	}

	private isValidFormat(value: string): boolean {
		// UUID format
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

		// Numeric format (pour compatibilité avec auto_increment MySQL)
		const numericRegex = /^\d+$/;

		return uuidRegex.test(value) || numericRegex.test(value);
	}

	public equals(other: StockId): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}

	/**
	 * Génère un nouvel ID unique
	 */
	public static generate(): StockId {
		return new StockId(randomUUID());
	}

	/**
	 * Crée un StockId à partir d'une valeur numérique (MySQL auto_increment)
	 */
	public static fromNumber(id: number): StockId {
		return new StockId(id.toString());
	}
}
