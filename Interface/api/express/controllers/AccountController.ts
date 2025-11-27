import { Request, Response } from "express";
import { CreateAccount } from "@application/use-cases";
import type { CreateAccountDTO } from "@application/use-cases";
import { AccountRepository } from "@infrastructure/database/mysql/AccountRepository";
import { UserRepository } from "@infrastructure/database/mysql/UserRepository";
import { AccountId } from "@domain/value-objects/AccountId";
import { UserId } from "@domain/value-objects/UserId";

/**
 * Controller pour les opérations liées aux comptes bancaires
 */
export class AccountController {
	private createAccountUseCase: CreateAccount;
	private accountRepository: AccountRepository;

	constructor() {
		const accountRepository = new AccountRepository();
		const userRepository = new UserRepository();
		this.createAccountUseCase = new CreateAccount(
			accountRepository,
			userRepository
		);
		this.accountRepository = accountRepository;
	}

	/**
	 * POST /api/accounts
	 * Créer un nouveau compte bancaire
	 */
	async create(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const dto: CreateAccountDTO = {
				...req.body,
				userId, // On utilise l'userId du token JWT
			};

			// Validation basique
			if (!dto.accountName || !dto.accountType) {
				res.status(400).json({
					success: false,
					error: "Nom du compte et type sont requis",
				});
				return;
			}

			const result = await this.createAccountUseCase.execute(dto);

			if (result.success) {
				res.status(201).json({
					success: true,
					message: "Compte créé avec succès",
					data: {
						accountId: result.accountId,
						iban: result.iban,
					},
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in create account:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la création du compte",
			});
		}
	}

	/**
	 * GET /api/accounts
	 * Récupérer tous les comptes de l'utilisateur connecté
	 */
	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const accounts = await this.accountRepository.findByUserId(
				new UserId(userId)
			);

			res.status(200).json({
				success: true,
				data: accounts.map((account) => ({
					id: account.id.value,
					iban: account.iban.formatted,
					name: account.accountName,
					type: account.accountType,
					balance: account.balance.amount,
					currency: account.balance.currency,
					interestRate: account.interestRate,
					isActive: account.isActive,
					createdAt: account.createdAt,
				})),
			});
		} catch (error) {
			console.error("Error in getAll accounts:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}

	/**
	 * GET /api/accounts/:id
	 * Récupérer un compte spécifique
	 */
	async getById(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;
			const accountId = req.params.id;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const account = await this.accountRepository.findById(
				new AccountId(accountId)
			);

			if (!account) {
				res.status(404).json({
					success: false,
					error: "Compte non trouvé",
				});
				return;
			}

			// Vérifier que le compte appartient bien à l'utilisateur
			if (account.userId.value !== userId) {
				res.status(403).json({
					success: false,
					error: "Accès non autorisé",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: {
					id: account.id.value,
					iban: account.iban.formatted,
					name: account.accountName,
					type: account.accountType,
					balance: account.balance.amount,
					currency: account.balance.currency,
					interestRate: account.interestRate,
					isActive: account.isActive,
					createdAt: account.createdAt,
					updatedAt: account.updatedAt,
				},
			});
		} catch (error) {
			console.error("Error in getById account:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}

	/**
	 * PUT /api/accounts/:id
	 * Mettre à jour un compte
	 */
	async update(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;
			const accountId = req.params.id;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const account = await this.accountRepository.findById(
				new AccountId(accountId)
			);

			if (!account) {
				res.status(404).json({
					success: false,
					error: "Compte non trouvé",
				});
				return;
			}

			// Vérifier que le compte appartient bien à l'utilisateur
			if (account.userId.value !== userId) {
				res.status(403).json({
					success: false,
					error: "Accès non autorisé",
				});
				return;
			}

			// Mettre à jour le nom du compte si fourni
			if (req.body.accountName) {
				account.updateName(req.body.accountName);
			}

			// Sauvegarder les modifications
			await this.accountRepository.save(account);

			// Récupérer le compte mis à jour
			const updatedAccount = await this.accountRepository.findById(
				new AccountId(accountId)
			);

			res.status(200).json({
				success: true,
				message: "Compte mis à jour avec succès",
				data: {
					id: updatedAccount!.id.value,
					iban: updatedAccount!.iban.value,
					name: updatedAccount!.accountName,
					type: updatedAccount!.accountType,
					balance: updatedAccount!.balance.amount,
					currency: updatedAccount!.balance.currency,
					interestRate: updatedAccount!.interestRate,
					isActive: updatedAccount!.isActive,
					createdAt: updatedAccount!.createdAt,
				},
			});
		} catch (error) {
			console.error("Error in update account:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}

	/**
	 * DELETE /api/accounts/:id
	 * Supprimer un compte
	 */
	async delete(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;
			const accountId = req.params.id;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const account = await this.accountRepository.findById(
				new AccountId(accountId)
			);

			if (!account) {
				res.status(404).json({
					success: false,
					error: "Compte non trouvé",
				});
				return;
			}

			// Vérifier que le compte appartient bien à l'utilisateur
			if (account.userId.value !== userId) {
				res.status(403).json({
					success: false,
					error: "Accès non autorisé",
				});
				return;
			}

			// Vérifier que le compte peut être supprimé (solde = 0)
			if (!account.canBeDeleted()) {
				res.status(400).json({
					success: false,
					error: "Le compte ne peut pas être supprimé (solde non nul)",
				});
				return;
			}

			await this.accountRepository.delete(new AccountId(accountId));

			res.status(200).json({
				success: true,
				message: "Compte supprimé avec succès",
			});
		} catch (error) {
			console.error("Error in delete account:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}

	/**
	 * GET /api/accounts/user/:userId
	 * Récupérer tous les comptes d'un utilisateur spécifique (conseiller/directeur uniquement)
	 */
	async getUserAccounts(req: Request, res: Response): Promise<void> {
		try {
			const requestingUserRole = (req as any).user?.role;
			const targetUserId = req.params.userId;

			if (!requestingUserRole) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			// Vérifier que l'utilisateur est conseiller ou directeur
			if (requestingUserRole !== "advisor") {
				res.status(403).json({
					success: false,
					error: "Accès réservé aux conseillers",
				});
				return;
			}

			const accounts = await this.accountRepository.findByUserId(
				new UserId(targetUserId)
			);

			res.status(200).json({
				success: true,
				data: accounts.map((account) => ({
					id: account.id.value,
					iban: account.iban.formatted,
					name: account.accountName,
					type: account.accountType,
					balance: account.balance.amount,
					currency: account.balance.currency,
					interestRate: account.interestRate,
					isActive: account.isActive,
					createdAt: account.createdAt,
				})),
			});
		} catch (error) {
			console.error("Error in getUserAccounts:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}
}
