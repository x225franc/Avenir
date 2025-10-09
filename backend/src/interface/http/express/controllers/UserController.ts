import { Request, Response } from "express";
import { RegisterUser, LoginUser, VerifyEmail } from "@application/use-cases";
import { RequestPasswordReset } from "@application/use-cases/user/RequestPasswordReset";
import { ResetPassword } from "@application/use-cases/user/ResetPassword";
import { UserRepository } from "@infrastructure/database/mysql/UserRepository";
import { AccountRepository } from "@infrastructure/database/mysql/AccountRepository";
import { RegisterUserDTO, LoginUserDTO } from "@application/dto";
import { UserId } from "@domain/value-objects/UserId";
import { emailService } from "@infrastructure/services/email.service";

/**
 * Controller pour les opérations liées aux utilisateurs
 */
export class UserController {
	private registerUserUseCase: RegisterUser;
	private loginUserUseCase: LoginUser;
	private verifyEmailUseCase: VerifyEmail;
	private requestPasswordResetUseCase: RequestPasswordReset;
	private resetPasswordUseCase: ResetPassword;

	constructor() {
		const userRepository = new UserRepository();
		const accountRepository = new AccountRepository();
		this.registerUserUseCase = new RegisterUser(userRepository, accountRepository);
		this.loginUserUseCase = new LoginUser(userRepository);
		this.verifyEmailUseCase = new VerifyEmail(userRepository);
		this.requestPasswordResetUseCase = new RequestPasswordReset(
			userRepository,
			emailService
		);
		this.resetPasswordUseCase = new ResetPassword(userRepository);
	}

	/**
	 * POST /api/users/register
	 * Inscription d'un nouvel utilisateur
	 */
	async register(req: Request, res: Response): Promise<void> {
		try {
			const dto: RegisterUserDTO = req.body;

			// Validation basique
			if (!dto.email || !dto.password || !dto.firstName || !dto.lastName) {
				res.status(400).json({
					success: false,
					error: "Email, mot de passe, prénom et nom sont requis",
				});
				return;
			}

			const result = await this.registerUserUseCase.execute(dto);

			if (result.success) {
				res.status(201).json({
					success: true,
					message: "Inscription réussie ! Vérifiez votre email.",
					data: {
						userId: result.userId,
						verificationToken: result.verificationToken,
					},
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in register:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de l'inscription",
			});
		}
	}

	/**
	 * POST /api/users/login
	 * Connexion d'un utilisateur
	 */
	async login(req: Request, res: Response): Promise<void> {
		try {
			const dto: LoginUserDTO = req.body;

			// Validation basique
			if (!dto.email || !dto.password) {
				res.status(400).json({
					success: false,
					error: "Email et mot de passe sont requis",
				});
				return;
			}

			const result = await this.loginUserUseCase.execute(dto);

			if (result.success) {
				res.status(200).json({
					success: true,
					message: "Connexion réussie",
					data: {
						token: result.token,
						userId: result.userId,
						email: result.email,
						role: result.role,
					},
				});
			} else {
				res.status(401).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in login:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la connexion",
			});
		}
	}

	/**
	 * GET /api/users/me
	 * Récupérer les informations de l'utilisateur connecté
	 * (Nécessite le middleware d'authentification)
	 */
	async getMe(req: Request, res: Response): Promise<void> {
		try {
			// Le middleware d'authentification aura ajouté req.user
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const userRepository = new UserRepository();
			const userIdObj = UserId.fromString(userId);
			const user = await userRepository.findById(userIdObj);

			if (!user) {
				res.status(404).json({
					success: false,
					error: "Utilisateur non trouvé",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: {
					id: user.id.value,
					email: user.email.value,
					firstName: user.firstName,
					lastName: user.lastName,
					fullName: user.fullName,
					phone: user.phone,
					address: user.address,
					role: user.role,
					emailVerified: user.emailVerified,
					createdAt: user.createdAt,
				},
			});
		} catch (error) {
			console.error("Error in getMe:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}

	/**
	 * GET /api/users/verify-email?token=XXX
	 * Vérifier l'email d'un utilisateur avec le token
	 */
	async verifyEmail(req: Request, res: Response): Promise<void> {
		try {
			const token = req.query.token as string;

			if (!token) {
				res.status(400).json({
					success: false,
					error: "Token de vérification manquant",
				});
				return;
			}

			const result = await this.verifyEmailUseCase.execute(token);

			if (result.success) {
				res.status(200).json({
					success: true,
					message: result.message,
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in verifyEmail:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la vérification",
			});
		}
	}

	/**
	 * POST /api/users/forgot-password
	 * Demande de réinitialisation de mot de passe
	 */
	async forgotPassword(req: Request, res: Response): Promise<void> {
		try {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({
					success: false,
					error: "Email requis",
				});
				return;
			}

			await this.requestPasswordResetUseCase.execute(email);

			// Toujours retourner succès pour ne pas révéler si l'email existe
			res.status(200).json({
				success: true,
				message:
					"Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
			});
		} catch (error) {
			console.error("Error in forgotPassword:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la demande de réinitialisation",
			});
		}
	}

	/**
	 * POST /api/users/reset-password
	 * Réinitialisation du mot de passe avec token
	 */
	async resetPassword(req: Request, res: Response): Promise<void> {
		try {
			const { token, newPassword } = req.body;

			if (!token || !newPassword) {
				res.status(400).json({
					success: false,
					error: "Token et nouveau mot de passe requis",
				});
				return;
			}

			if (newPassword.length < 6) {
				res.status(400).json({
					success: false,
					error: "Le mot de passe doit contenir au moins 6 caractères",
				});
				return;
			}

			await this.resetPasswordUseCase.execute(token, newPassword);

			res.status(200).json({
				success: true,
				message: "Mot de passe réinitialisé avec succès",
			});
		} catch (error: any) {
			console.error("Error in resetPassword:", error);
			res.status(400).json({
				success: false,
				error: error.message || "Erreur lors de la réinitialisation du mot de passe",
			});
		}
	}
}
