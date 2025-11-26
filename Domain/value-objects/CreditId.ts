/**
 * Value Object : CreditId
 * Identifiant unique d'un crédit
 */
export class CreditId {
	private readonly value: number;

	constructor(value: number) {
		if (value <= 0) {
			throw new Error("CreditId must be a positive number");
		}
		this.value = value;
	}

	getValue(): number {
		return this.value;
	}

	equals(other: CreditId): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value.toString();
	}
}
