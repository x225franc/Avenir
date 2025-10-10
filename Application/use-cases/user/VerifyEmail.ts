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
			// 1. Décoder le token (format: base64 de "userId:timestamp")
			let userId: string;
			let timestamp: number;

			try {
				const decoded = Buffer.from(token, "base64").toString("utf-8");
				const parts = decoded.split(":");
				
				if (parts.length !== 2) {
					return {
						success: false,
						error: "Token de vérification invalide",
					};
				}

				userId = parts[0];
				timestamp = parseInt(parts[1], 10);
			} catch (error) {
				return {
					success: false,
					error: "Token de vérification invalide",
				};
			}

			// 2. Vérifier que le token n'est pas expiré (valide pendant 24h)
			const tokenAge = Date.now() - timestamp;
			const twentyFourHours = 24 * 60 * 60 * 1000;

			if (tokenAge > twentyFourHours) {
				return {
					success: false,
					error: "Le lien de vérification a expiré. Veuillez demander un nouveau lien.",
				};
			}

			// 3. Trouver l'utilisateur
			const userIdObj = UserId.fromString(userId);
			const user = await this.userRepository.findById(userIdObj);

			if (!user) {
				return {
					success: false,
					error: "Utilisateur non trouvé",
				};
			}

			// 4. Vérifier que le token correspond à celui stocké en BDD
			if (user.verificationToken !== token) {
				return {
					success: false,
					error: "Token de vérification invalide ou expiré",
				};
			}

			// 5. Vérifier que l'email n'est pas déjà vérifié
			if (user.emailVerified) {
				return {
					success: true,
					message: "Votre email est déjà vérifié. Vous pouvez vous connecter.",
				};
			}

			// 6. Marquer l'email comme vérifié (efface aussi le token)
			user.verifyEmail();

			// 7. Sauvegarder les modifications
			await this.userRepository.save(user);

			// 8. Envoyer un email de bienvenue
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
