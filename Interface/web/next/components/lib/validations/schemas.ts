import { z } from "zod";

/**
 * Schéma de validation pour le mot de passe (réutilisable)
 */
export const passwordSchema = z
	.string()
	.min(8, "Le mot de passe doit contenir au moins 8 caractères")
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
		"Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
	);

/**
 * Schéma de validation pour l'inscription
 * Utilisé avec React Hook Form
 */
export const registerSchema = z
	.object({
		email: z
			.string()
			.min(1, "L'email est requis")
			.email("Format d'email invalide"),
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
		firstName: z
			.string()
			.min(2, "Le prénom doit contenir au moins 2 caractères")
			.max(50, "Le prénom ne peut pas dépasser 50 caractères"),
		lastName: z
			.string()
			.min(2, "Le nom doit contenir au moins 2 caractères")
			.max(50, "Le nom ne peut pas dépasser 50 caractères"),
		phoneNumber: z
			.string()
			.regex(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro de téléphone invalide")
			.optional()
			.or(z.literal("")),
		address: z.string().max(200, "L'adresse ne peut pas dépasser 200 caractères").optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas",
		path: ["confirmPassword"],
	});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "L'email est requis")
		.email("Format d'email invalide"),
	password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schéma de validation pour la création de compte bancaire
 */
export const createAccountSchema = z.object({
	accountName: z
		.string()
		.min(3, "Le nom du compte doit contenir au moins 3 caractères")
		.max(50, "Le nom du compte ne peut pas dépasser 50 caractères"),
	accountType: z.enum(["checking", "savings", "investment"], {
		message: "Le type de compte est requis",
	}),
	initialDeposit: z
		.number()
		.min(0, "Le dépôt initial ne peut pas être négatif")
		.optional(),
	currency: z.string().default("EUR"),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

/**
 * Schéma de validation pour le transfert d'argent
 */
export const transferMoneySchema = z.object({
	sourceAccountId: z.string().min(1, "Le compte source est requis"),
	destinationIBAN: z
		.string()
		.min(1, "L'IBAN de destination est requis")
		.regex(/^FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{3}$/, "Format d'IBAN invalide"),
	amount: z
		.number()
		.min(0.01, "Le montant doit être supérieur à 0")
		.max(1000000, "Le montant ne peut pas dépasser 1 000 000€"),
	currency: z.string().default("EUR"),
	description: z
		.string()
		.max(200, "La description ne peut pas dépasser 200 caractères")
		.optional(),
});

export type TransferMoneyFormData = z.infer<typeof transferMoneySchema>;

/**
 * Schéma de validation pour la réinitialisation de mot de passe
 */
export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas",
		path: ["confirmPassword"],
	});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
