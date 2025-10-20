import { IUserRepository } from "@domain/repositories/IUserRepository";
import { IAccountRepository } from "@domain/repositories/IAccountRepository";
import { User, UserRole } from "@domain/entities/User";
import { Account, AccountType } from "@domain/entities/Account";
import { Email } from "@domain/value-objects/Email";
import { RegisterUserDTO } from "@application/dto";
import { emailService } from "@infrastructure/services/email.service";
import bcrypt from "bcrypt";

export interface RegisterUserResult {
	success: boolean;
	userId?: string;
	error?: string;
	verificationToken?: string;
}

/**
 * Use Case: Inscription d'un nouvel utilisateur
 * 
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que l'email n'existe pas déjà
 * - Hasher le mot de passe
 * - Créer l'entité User
 * - Sauvegarder dans le repository
 * - Générer un token de vérification d'email
 */
export class RegisterUser {
	private readonly SALT_ROUNDS = 10;

	constructor(
		private userRepository: IUserRepository,
		private accountRepository: IAccountRepository
	) {}

	async execute(dto: RegisterUserDTO): Promise<RegisterUserResult> {
		try {
			// 1. Valider l'email
			const email = new Email(dto.email);

			// 2. Vérifier que l'email n'existe pas déjà
			const emailExists = await this.userRepository.emailExists(email);
			if (emailExists) {
				return {
					success: false,
					error: "Un compte avec cet email existe déjà",
				};
			}

			// 3. Hasher le mot de passe
			const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

			// 4. Créer l'entité User (avec UserRole.CLIENT par défaut)
			const user = User.create({
				email,
				passwordHash: hashedPassword,
				firstName: dto.firstName.trim(),
				lastName: dto.lastName.trim(),
				phone: dto.phoneNumber?.trim(),
				address: dto.address?.trim(),
				role: UserRole.CLIENT,
				emailVerified: false,
				verificationToken: undefined,
				passwordResetToken: undefined,
				isBanned: false,
			});

			// 5. Sauvegarder dans le repository (pour obtenir l'ID réel de MySQL)
			await this.userRepository.save(user);

			// 6. Générer et assigner le token de vérification APRÈS avoir l'ID réel
			// Format: userId:timestamp encodé en base64
			// Le timestamp permet de vérifier l'expiration (24h)
			const verificationToken = Buffer.from(
				`${user.id.value}:${Date.now()}`
			).toString("base64");
			user.setVerificationToken(verificationToken);

			// 7. Sauvegarder à nouveau pour mettre à jour le token en BDD
			await this.userRepository.save(user);

			console.log(`✅ Utilisateur créé avec ID: ${user.id.value}, Token: ${verificationToken}`);

			// 8. Créer automatiquement un compte courant pour le nouveau client
			try {
				const defaultAccount = Account.create({
					userId: user.id,
					accountName: "Compte Courant",
					accountType: AccountType.CHECKING,
					interestRate: undefined,
				});

				await this.accountRepository.save(defaultAccount);
				
				console.log(`✅ Compte courant créé automatiquement avec IBAN: ${defaultAccount.iban.value}, Account ID: ${defaultAccount.id.value}`);
			} catch (accountError) {
				console.error(`❌ Erreur création compte courant:`, accountError);
				// On continue même si la création du compte échoue
			}

			// 9. Envoyer l'email de vérification
			try {
				await emailService.sendVerificationEmail(
					dto.email,
					dto.firstName,
					verificationToken
				);
				console.log(`✅ Email de vérification envoyé à ${dto.email}`);
			} catch (emailError) {
				console.error(
					`❌ Erreur d'envoi d'email (utilisateur créé quand même):`,
					emailError
				);
				// On continue même si l'email échoue, l'utilisateur est créé
			}

			return {
				success: true,
				userId: user.id.value,
				verificationToken,
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
				error: "Une erreur inattendue s'est produite lors de l'inscription",
			};
		}
	}
}
