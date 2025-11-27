/**
 * Value Object : Email
 * Adresse email valide
 */
export class Email {
	private readonly _value: string;

	constructor(value: string) {
		if (!this.isValid(value)) {
			throw new Error(`Invalid email format: ${value}`);
		}
		this._value = value.toLowerCase().trim();
	}

	get value(): string {
		return this._value;
	}

	private isValid(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email) && email.length <= 255;
	}

	public equals(other: Email): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}

	public static isValidEmail(email: string): boolean {
		try {
			new Email(email);
			return true;
		} catch {
			return false;
		}
	}
}
