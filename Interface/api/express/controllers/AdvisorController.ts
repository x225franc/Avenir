import { Request, Response } from "express";
import { UserRepository } from "../../../../Infrastructure/database/mysql/UserRepository";
import { TransactionRepository } from "../../../../Infrastructure/database/mysql/TransactionRepository";
import { AccountRepository } from "../../../../Infrastructure/database/mysql/AccountRepository";
import { TransactionStatus } from "../../../../Domain/enums/TransactionStatus";
import { TransactionId } from "../../../../Domain/value-objects/TransactionId";
import { UserId } from "../../../../Domain/value-objects/UserId";
import { emailService } from "../../../../Infrastructure/services/email.service";

/**
 * Controller pour les opérations des conseillers
 */
export class AdvisorController {
	private userRepository: UserRepository;
	private transactionRepository: TransactionRepository;
	private accountRepository: AccountRepository;

	constructor() {
		this.userRepository = new UserRepository();
		this.transactionRepository = new TransactionRepository();
		this.accountRepository = new AccountRepository();
	}

	/**
	 * GET /api/advisor/advisors
	 * Récupère tous les conseillers pour le transfert de conversations
	 */
	async getAdvisors(req: Request, res: Response): Promise<void> {
		try {
			// Récupérer tous les utilisateurs avec le rôle advisor
			const advisors = await this.userRepository.findByRole("advisor");
			const advisorsData = advisors.map((advisor: any) => ({
				id: advisor.id.value,
				email: advisor.email.value,
				firstName: advisor.firstName,
				lastName: advisor.lastName,
				fullName: `${advisor.firstName} ${advisor.lastName}`,
			}));

			res.status(200).json({
				success: true,
				data: advisorsData,
			});
		} catch (error) {
			console.error("Error in getAdvisors:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la récupération des conseillers",
			});
		}
	}

	/**
	 * GET /api/advisor/clients
	 * Récupère tous les clients pour consultation
	 */
	async getClients(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un conseiller
			const userRole = (req as any).user?.role;
			if (userRole !== "advisor") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers peuvent accéder à cette ressource.",
				});
				return;
			}

			const users = await this.userRepository.findAll();
			const usersData = users.map((user: any) => ({
				id: user.id.value,
				email: user.email.value,
				firstName: user.firstName,
				lastName: user.lastName,
				fullName: `${user.firstName} ${user.lastName}`,
				phone: user.phone,
				address: user.address,
				role: user.role,
				emailVerified: user.emailVerified,
				isEmailVerified: user.emailVerified,
				isBanned: user.isBanned,
				createdAt: user.createdAt,
			}));

			res.status(200).json({
				success: true,
				data: usersData,
			});
		} catch (error) {
			console.error("Error in getClients:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la récupération des clients",
			});
		}
	}

	/**
	 * GET /api/advisor/transactions
	 * Récupère toutes les transactions pour consultation
	 */
	async getAllTransactions(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un conseiller
			const userRole = (req as any).user?.role;
			if (userRole !== "advisor") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers peuvent accéder à cette ressource.",
				});
				return;
			}

			const transactions = await this.transactionRepository.findAll();
			const transactionsData = transactions.map((transaction: any) => ({
				id: transaction.getId().getValue(),
				fromAccountId: transaction.getFromAccountId()?.value,
				toAccountId: transaction.getToAccountId()?.value,
				amount: transaction.getAmount().amount,
				currency: transaction.getAmount().currency,
				type: transaction.getType(),
				status: transaction.getStatus().toLowerCase(),
				description: transaction.getDescription(),
				createdAt: transaction.getCreatedAt(),
			}));

			res.status(200).json({
				success: true,
				data: transactionsData,
			});
		} catch (error) {
			console.error("Error in getAllTransactions:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la récupération des transactions",
			});
		}
	}

	/**
	 * GET /api/advisor/transactions/pending
	 * Récupère les transactions en attente
	 */
	async getPendingTransactions(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un conseiller
			const userRole = (req as any).user?.role;
			if (userRole !== "advisor") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers peuvent accéder à cette ressource.",
				});
				return;
			}

			const transactions = await this.transactionRepository.findByStatus(
				"PENDING"
			);
			const transactionsData = [] as any[];
			for (const transaction of transactions) {
				let sourceAccount: any = undefined;
				let destinationAccount: any = undefined;

				const fromId = transaction.getFromAccountId()?.value;
				const toId = transaction.getToAccountId()?.value;

				if (fromId) {
					const acc = await this.accountRepository.findById({
						value: fromId,
					} as any);
					if (acc) {
						const user = await this.userRepository.findById(acc.userId);
						sourceAccount = {
							id: acc.id.value,
							accountNumber: acc.id.value,
							iban: acc.iban.value,
							accountType: acc.accountType,
							user: user
								? {
										id: user.id.value,
										firstName: user.firstName,
										lastName: user.lastName,
										email: user.email.value,
								  }
								: undefined,
						};
					}
				}

				if (toId) {
					const acc = await this.accountRepository.findById({
						value: toId,
					} as any);
					if (acc) {
						const user = await this.userRepository.findById(acc.userId);
						destinationAccount = {
							id: acc.id.value,
							accountNumber: acc.id.value,
							iban: acc.iban.value,
							accountType: acc.accountType,
							user: user
								? {
										id: user.id.value,
										firstName: user.firstName,
										lastName: user.lastName,
										email: user.email.value,
								  }
								: undefined,
						};
					}
				}

				transactionsData.push({
					id: transaction.getId().getValue(),
					fromAccountId: fromId,
					toAccountId: toId,
					amount: transaction.getAmount().amount,
					currency: transaction.getAmount().currency,
					type: transaction.getType(),
					status: transaction.getStatus().toLowerCase(),
					description: transaction.getDescription(),
					createdAt: transaction.getCreatedAt(),
					sourceAccount,
					destinationAccount,
				});
			}

			res.status(200).json({
				success: true,
				data: transactionsData,
			});
		} catch (error) {
			console.error("Error in getPendingTransactions:", error);
			res.status(500).json({
				success: false,
				error:
					"Erreur serveur lors de la récupération des transactions en attente",
			});
		}
	}

	/**
	 * PATCH /api/advisor/transactions/:id/approve
	 * Approuver une transaction
	 */
	async approveTransaction(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un conseiller
			const userRole = (req as any).user?.role;
			if (userRole !== "advisor") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers peuvent approuver des transactions.",
				});
				return;
			}

			const { id } = req.params;

			if (!id) {
				res.status(400).json({
					success: false,
					error: "ID de transaction requis",
				});
				return;
			}

			const transaction = await this.transactionRepository.findById(
				TransactionId.create(id)
			);

			if (!transaction) {
				res.status(404).json({
					success: false,
					error: "Transaction non trouvée",
				});
				return;
			}

			if (transaction.getStatus() !== TransactionStatus.PENDING) {
				res.status(400).json({
					success: false,
					error: "Seules les transactions en attente peuvent être approuvées",
				});
				return;
			}

			// Créditer le compte destination si applicable
			const toAccountId = transaction.getToAccountId()?.value;
			if (toAccountId) {
				const destinationAccount = await this.accountRepository.findById({
					value: toAccountId,
				} as any);
				if (destinationAccount) {
					// Créditer le montant sur le compte destination
					destinationAccount.credit(transaction.getAmount());
					await this.accountRepository.save(destinationAccount);
				}
			}

			// Approuver la transaction
			transaction.approve();
			await this.transactionRepository.update(transaction);

			res.status(200).json({
				success: true,
				message: "Transaction approuvée avec succès",
				data: {
					id: transaction.getId().getValue(),
					status: transaction.getStatus().toLowerCase(),
				},
			});
		} catch (error) {
			console.error("Error in approveTransaction:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de l'approbation de la transaction",
			});
		}
	}

	/**
	 * PATCH /api/advisor/transactions/:id/reject
	 * Rejeter une transaction
	 */
	async rejectTransaction(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un conseiller
			const userRole = (req as any).user?.role;
			if (userRole !== "advisor") {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers peuvent rejeter des transactions.",
				});
				return;
			}

			const { id } = req.params;

			if (!id) {
				res.status(400).json({
					success: false,
					error: "ID de transaction requis",
				});
				return;
			}

			const transaction = await this.transactionRepository.findById(
				TransactionId.create(id)
			);

			if (!transaction) {
				res.status(404).json({
					success: false,
					error: "Transaction non trouvée",
				});
				return;
			}

			if (transaction.getStatus() !== TransactionStatus.PENDING) {
				res.status(400).json({
					success: false,
					error: "Seules les transactions en attente peuvent être rejetées",
				});
				return;
			}

			// Rembourser le compte source (le débit a été effectué lors de la création)
			const fromAccountId = transaction.getFromAccountId()?.value;
			if (fromAccountId) {
				const sourceAccount = await this.accountRepository.findById({
					value: fromAccountId,
				} as any);
				if (sourceAccount) {
					// Créditer le montant sur le compte source pour rembourser
					sourceAccount.credit(transaction.getAmount());
					await this.accountRepository.save(sourceAccount);
				}
			}

			// Rejeter la transaction
			transaction.reject();
			await this.transactionRepository.update(transaction);

			res.status(200).json({
				success: true,
				message: "Transaction rejetée avec succès",
				data: {
					id: transaction.getId().getValue(),
					status: transaction.getStatus().toLowerCase(),
				},
			});
		} catch (error) {
			console.error("Error in rejectTransaction:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors du rejet de la transaction",
			});
		}
	}

	async notifyClient(req: Request, res: Response): Promise<void> {
		try {
			const { clientId, subject, message } = req.body;

			// Valider les entrées
			if (!clientId || !subject || !message) {
				res.status(400).json({
					success: false,
					error: "Tous les champs sont requis (clientId, subject, message)",
				});
				return;
			}

			// Récupérer le client depuis le dépôt
			const client = await this.userRepository.findById(
				UserId.fromString(clientId)
			);

			if (!client) {
				res.status(404).json({
					success: false,
					error: "Client non trouvé",
				});
				return;
			}

			// Envoyer l'email de notification
			await emailService.sendAdvisorNotificationEmail(
				client.email.value,
				client.firstName,
				subject,
				message
			);

			res.status(200).json({
				success: true,
				message: "Notification envoyée avec succès",
			});
		} catch (error) {
			console.error("Error in notifyClient:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de l'envoi de la notification",
			});
		}
	}
}
