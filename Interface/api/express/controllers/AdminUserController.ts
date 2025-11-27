import { Request, Response } from "express";
import { UserRepository } from "../../../../Infrastructure/database/mysql/UserRepository";
import { AccountRepository } from "../../../../Infrastructure/database/mysql/AccountRepository";
import { RegisterUser } from "../../../../Application/use-cases/user/RegisterUser";
import { User, UserRole } from "../../../../Domain/entities/User";
import { UserId } from "../../../../Domain/value-objects/UserId";
import { Email } from "../../../../Domain/value-objects/Email";

/**
 * Controller pour les opérations administratives sur les utilisateurs
 * Réservé aux directeurs uniquement
 */
export class AdminUserController {
	private userRepository: UserRepository;
	private accountRepository: AccountRepository;
	private registerUserUseCase: RegisterUser;

	constructor() {
		this.userRepository = new UserRepository();
		this.accountRepository = new AccountRepository();
		this.registerUserUseCase = new RegisterUser(
			this.userRepository,
			this.accountRepository
		);
	}

	/**
	 * GET /api/admin/users
	 * Récupère tous les utilisateurs
	 */
	async getAllUsers(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les directeurs peuvent accéder à cette ressource.",
				});
				return;
			}

			const users = await this.userRepository.findAll();
			const usersData = users.map((user) => user.toJSON());

			res.status(200).json({
				success: true,
				data: usersData,
			});
		} catch (error) {
			console.error("Error in getAllUsers:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la récupération des utilisateurs",
			});
		}
	}

	/**
	 * GET /api/admin/users/:id
	 * Récupère un utilisateur par son ID
	 */
	async getUserById(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les directeurs peuvent accéder à cette ressource.",
				});
				return;
			}

			const { id } = req.params;

			if (!id) {
				res.status(400).json({
					success: false,
					error: "ID utilisateur requis",
				});
				return;
			}

			const userId = new UserId(id);
			const user = await this.userRepository.findById(userId);

			if (!user) {
				res.status(404).json({
					success: false,
					error: "Utilisateur non trouvé",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: user.toJSON(),
			});
		} catch (error) {
			console.error("Error in getUserById:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la récupération de l'utilisateur",
			});
		}
	}

	/**
	 * POST /api/admin/users
	 * Créer un nouvel utilisateur
	 */
	async createUser(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les directeurs peuvent créer des utilisateurs.",
				});
				return;
			}

			const {
				email,
				password,
				firstName,
				lastName,
				phoneNumber,
				address,
				role,
			} = req.body;

			// Validation des données
			if (!email || !password || !firstName || !lastName || !role) {
				res.status(400).json({
					success: false,
					error: "Email, mot de passe, prénom, nom et rôle sont requis",
				});
				return;
			}

			// Valider le rôle
			if (!Object.values(UserRole).includes(role)) {
				res.status(400).json({
					success: false,
					error: "Rôle invalide",
				});
				return;
			}

			// Utiliser le use case existant avec le rôle spécifié
			const result = await this.registerUserUseCase.execute({
				email,
				password,
				firstName,
				lastName,
				phoneNumber,
				address,
				role, // Le rôle sera utilisé au lieu du rôle par défaut "client"
			});

			if (result.success) {
				res.status(201).json({
					success: true,
					message: "Utilisateur créé avec succès",
					data: {
						userId: result.userId,
					},
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in createUser:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la création de l'utilisateur",
			});
		}
	}

	/**
	 * PUT /api/admin/users/:id
	 * Mettre à jour un utilisateur
	 */
	async updateUser(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les directeurs peuvent modifier des utilisateurs.",
				});
				return;
			}

			const { id } = req.params;
			const { firstName, lastName, phoneNumber, address, role, emailVerified } =
				req.body;

			if (!id) {
				res.status(400).json({
					success: false,
					error: "ID utilisateur requis",
				});
				return;
			}

			const userId = new UserId(id);
			const user = await this.userRepository.findById(userId);

			if (!user) {
				res.status(404).json({
					success: false,
					error: "Utilisateur non trouvé",
				});
				return;
			}

			// Valider le rôle si fourni
			if (role && !Object.values(UserRole).includes(role)) {
				res.status(400).json({
					success: false,
					error: "Rôle invalide",
				});
				return;
			}

			// Mettre à jour les propriétés
			if (
				firstName !== undefined ||
				lastName !== undefined ||
				phoneNumber !== undefined ||
				address !== undefined
			) {
				user.updateProfile({
					firstName,
					lastName,
					phone: phoneNumber,
					address,
				});
			}

			if (role !== undefined) {
				user.updateRole(role);
			}

			if (emailVerified !== undefined) {
				user.setEmailVerified(emailVerified);
			}

			await this.userRepository.save(user);

			res.status(200).json({
				success: true,
				message: "Utilisateur mis à jour avec succès",
				data: user.toJSON(),
			});
		} catch (error) {
			console.error("Error in updateUser:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la mise à jour de l'utilisateur",
			});
		}
	}

	/**
	 * DELETE /api/admin/users/:id
	 * Supprimer un utilisateur
	 */
	async deleteUser(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les directeurs peuvent supprimer des utilisateurs.",
				});
				return;
			}

			const { id } = req.params;

			if (!id) {
				res.status(400).json({
					success: false,
					error: "ID utilisateur requis",
				});
				return;
			}

			const userId = new UserId(id);
			const user = await this.userRepository.findById(userId);

			if (!user) {
				res.status(404).json({
					success: false,
					error: "Utilisateur non trouvé",
				});
				return;
			}

			// Ne pas permettre la suppression du compte actuellement connecté
			const currentUserId = (req as any).user?.userId;
			if (currentUserId === id) {
				res.status(400).json({
					success: false,
					error: "Vous ne pouvez pas supprimer votre propre compte",
				});
				return;
			}

			await this.userRepository.delete(userId);

			res.status(200).json({
				success: true,
				message: "Utilisateur supprimé avec succès",
			});
		} catch (error) {
			console.error("Error in deleteUser:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la suppression de l'utilisateur",
			});
		}
	}

	/**
	 * PATCH /api/admin/users/:id/ban
	 * Bannir un utilisateur
	 */
	async banUser(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les directeurs peuvent bannir des utilisateurs.",
				});
				return;
			}

			const { id } = req.params;

			if (!id) {
				res.status(400).json({
					success: false,
					error: "ID utilisateur requis",
				});
				return;
			}

			const userId = new UserId(id);
			const user = await this.userRepository.findById(userId);

			if (!user) {
				res.status(404).json({
					success: false,
					error: "Utilisateur non trouvé",
				});
				return;
			}

			// Ne pas permettre le bannissement du compte actuellement connecté
			const currentUserId = (req as any).user?.userId;
			if (currentUserId === id) {
				res.status(400).json({
					success: false,
					error: "Vous ne pouvez pas bannir votre propre compte",
				});
				return;
			}

			user.banUser();
			await this.userRepository.save(user);

			res.status(200).json({
				success: true,
				message: "Utilisateur banni avec succès",
				data: user.toJSON(),
			});
		} catch (error) {
			console.error("Error in banUser:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors du bannissement de l'utilisateur",
			});
		}
	}

	/**
	 * PATCH /api/admin/users/:id/unban
	 * Débannir un utilisateur
	 */
	async unbanUser(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les directeurs peuvent débannir des utilisateurs.",
				});
				return;
			}

			const { id } = req.params;

			if (!id) {
				res.status(400).json({
					success: false,
					error: "ID utilisateur requis",
				});
				return;
			}

			const userId = new UserId(id);
			const user = await this.userRepository.findById(userId);

			if (!user) {
				res.status(404).json({
					success: false,
					error: "Utilisateur non trouvé",
				});
				return;
			}

			user.unbanUser();
			await this.userRepository.save(user);

			res.status(200).json({
				success: true,
				message: "Utilisateur débanni avec succès",
				data: user.toJSON(),
			});
		} catch (error) {
			console.error("Error in unbanUser:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors du débannissement de l'utilisateur",
			});
		}
	}
}
