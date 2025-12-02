import { IUserRepository } from "@domain/repositories/IUserRepository";
import { Email } from "@domain/value-objects/Email";
import { UserId } from "@domain/value-objects/UserId";
import { emailService } from "@infrastructure/services/email.service";

export interface VerifyEmailResult {
	success: boolean;
	message?: string;
	error?: string;
}

/**
 * Use Case: Vérification de l'email d'un utilisateur
 * 
 * Responsabilités:
 * - Décoder le token de vérification
 * - Trouver l'utilisateur correspondant
 * - Vérifier que le token est valide
 * - Marquer l'email comme vérifié
 */
export class VerifyEmail {
	constructor(private userRepository: IUserRepository) {}

	async execute(token: string): Promise<VerifyEmailResult> {
		try {
			// 1. Trouver l'utilisateur avec ce token
			const user = await this.userRepository.findByVerificationToken(token);

			if (!user) {
				return {
					success: false,
					error: "Token de vérification invalide ou expiré",
				};
			}

			// 2. Vérifier que l'email n'est pas déjà vérifié
			if (user.emailVerified) {
				return {
					success: true,
					message: "Votre email est déjà vérifié. Vous pouvez vous connecter.",
				};
			}

			// 3. Marquer l'email comme vérifié
			user.verifyEmail();

			// 4. Sauvegarder les modifications
			await this.userRepository.save(user);

			// 5. Envoyer un email de bienvenue
			try {
				await emailService.sendWelcomeEmail(
					user.email.value,
					user.firstName
				);
				console.log(`✅ Email de bienvenue envoyé à ${user.email.value}`);
			} catch (emailError) {
				console.error(
					`❌ Erreur d'envoi d'email de bienvenue:`,
					emailError
				);
				// On continue même si l'email échoue
			}

			return {
				success: true,
				message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
			};
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: false,
				error: "Une erreur inattendue s'est produite lors de la vérification",
			};
		}
	}
}
