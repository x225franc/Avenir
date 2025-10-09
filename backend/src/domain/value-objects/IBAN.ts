/**
 * Value Object : IBAN (International Bank Account Number)
 * Format français : FR76 XXXX XXXX XXXX XXXX XXXX XXX (27 caractères)
 */
export class IBAN {
	private readonly _value: string;

	constructor(value: string) {
		const cleanValue = value.replace(/\s/g, "").toUpperCase();

		if (!this.isValid(cleanValue)) {
			throw new Error(`Invalid IBAN format: ${value}`);
		}

		this._value = cleanValue;
	}

	get value(): string {
		return this._value;
	}

	/**
	 * Formate l'IBAN avec des espaces pour la lisibilité
	 * FR76 1234 5678 9012 3456 7890 123
	 */
	get formatted(): string {
		return this._value.replace(/(.{4})/g, "$1 ").trim();
	}

	private isValid(iban: string): boolean {
		// Vérifier le format de base (FR + 25 chiffres)
		if (!/^FR\d{25}$/.test(iban)) {
			return false;
		}

		// Validation mathématique IBAN (modulo 97)
		return this.validateChecksum(iban);
	}

	private validateChecksum(iban: string): boolean {
		// Déplacer les 4 premiers caractères à la fin
		const rearranged = iban.slice(4) + iban.slice(0, 4);

		// Remplacer les lettres par des chiffres (A=10, B=11, ..., Z=35)
		const numericString = rearranged.replace(/[A-Z]/g, (char) =>
			(char.charCodeAt(0) - 55).toString()
		);

		// Calculer le modulo 97
		return this.mod97(numericString) === 1;
	}

	private mod97(numericString: string): number {
		let remainder = 0;
		for (let i = 0; i < numericString.length; i++) {
			remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97;
		}
		return remainder;
	}

	public equals(other: IBAN): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}

	/**
	 * Génère un IBAN français valide aléatoire
	 */
	public static generate(): IBAN {
		// Générer 23 chiffres aléatoires
		let accountNumber = "";
		for (let i = 0; i < 23; i++) {
			accountNumber += Math.floor(Math.random() * 10);
		}

		// Calculer la clé de contrôle
		const checkDigits = this.calculateCheckDigits("FR", accountNumber);

		return new IBAN(`FR${checkDigits}${accountNumber}`);
	}

	private static calculateCheckDigits(
		countryCode: string,
		accountNumber: string
	): string {
		// Construire l'IBAN temporaire avec 00 comme clé
		const tempIban = accountNumber + countryCode + "00";

		// Convertir en numérique
		const numericString = tempIban.replace(/[A-Z]/g, (char) =>
			(char.charCodeAt(0) - 55).toString()
		);

		// Calculer le modulo et obtenir la clé
		const mod = this.mod97Static(numericString);
		const checkDigits = (98 - mod).toString().padStart(2, "0");

		return checkDigits;
	}

	private static mod97Static(numericString: string): number {
		let remainder = 0;
		for (let i = 0; i < numericString.length; i++) {
			remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97;
		}
		return remainder;
	}
}
