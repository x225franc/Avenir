/**
 * DTO (Data Transfer Objects) pour la validation côté API
 * Ces DTO seront aussi utilisés côté frontend avec Zod + React Hook Form
 */

/**
 * DTO pour l'inscription d'un utilisateur
 */
export interface RegisterUserDTO {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	address?: string;
}

/**
 * DTO pour la connexion d'un utilisateur
 */
export interface LoginUserDTO {
	email: string;
	password: string;
}

/**
 * DTO pour la création d'un compte
 */
export interface CreateAccountDTO {
	userId: string;
	accountName: string;
	accountType: "checking" | "savings" | "investment";
	initialDeposit?: number;
	currency?: string;
}

/**
 * DTO pour le transfert d'argent
 */
export interface TransferMoneyDTO {
	sourceAccountId: string;
	destinationIBAN: string;
	amount: number;
	currency: string;
	description?: string;
}

/**
 * DTO pour mettre à jour le profil utilisateur
 */
export interface UpdateUserProfileDTO {
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	address?: string;
}

/**
 * DTO pour renommer un compte
 */
export interface RenameAccountDTO {
	accountId: string;
	newName: string;
}
