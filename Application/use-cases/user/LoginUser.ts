import { IUserRepository } from "@domain/repositories/IUserRepository";
import { config } from "@infrastructure/config/database";
import { Email } from "@domain/value-objects/Email";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface LoginUserDTO {
	email: string;
	password: string;
}

export interface LoginUserResult {
	success: boolean;
	token?: string;
	userId?: string;
	email?: string;
	role?: string;
	error?: string;
}

/**
 * Use Case: Connexion d'un utilisateur
 * 
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que l'utilisateur existe
 * - Vérifier le mot de passe
 * - Vérifier que l'utilisateur n'est pas banni
 * - Vérifier que l'email est vérifié
 * - Générer un JWT token
 */
export class LoginUser {
	constructor(private userRepository: IUserRepository) {}

	async execute(dto: LoginUserDTO): Promise<LoginUserResult> {
		try {
			// 1. Valider l'email
			const email = new Email(dto.email);

			// 2. Trouver l'utilisateur par email
			const user = await this.userRepository.findByEmail(email);
			if (!user) {
				return {
					success: false,
					error: "Email ou mot de passe incorrect",
				};
			}

			// 3. Vérifier que l'utilisateur n'est pas banni
			if (user.isBanned) {
				return {
					success: false,
					error: "Votre compte a été suspendu. Contactez le support.",
				};
			}

			// 4. Vérifier que l'email est vérifié
			if (!user.emailVerified) {
				return {
					success: false,
					error: "Veuillez vérifier votre email avant de vous connecter",
				};
			}

			// 5. Vérifier le mot de passe
			const passwordMatch = await bcrypt.compare(
				dto.password,
				user.passwordHash
			);

			if (!passwordMatch) {
				return {
					success: false,
					error: "Email ou mot de passe incorrect",
				};
			}

			// 6. Générer le JWT token
			const token = jwt.sign(
				{
					userId: user.id.value,
					email: user.email.value,
					role: user.role,
				},
				config.jwtSecret,
				{
					expiresIn: "7d", // 7 jours
				}
			);

			return {
				success: true,
				token,
				userId: user.id.value,
				email: user.email.value,
				role: user.role,
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
				error: "Une erreur inattendue s'est produite lors de la connexion",
			};
		}
	}
}
