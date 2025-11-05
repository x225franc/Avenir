import { Request, Response } from "express";
import { TransferMoney } from "@application/use-cases";
import { AccountRepository } from "@infrastructure/database/mysql/AccountRepository";
import { TransferMoneyDTO } from "@application/dto";
import { TransactionRepository } from "../../../../Infrastructure/database/mysql/TransactionRepository";
import { Transaction } from "../../../../Domain/entities/Transaction";
import { AccountId } from "../../../../Domain/value-objects/AccountId";
import { UserId } from "../../../../Domain/value-objects/UserId";
import { Money } from "../../../../Domain/value-objects/Money";
import { TransactionType } from "../../../../Domain/enums/TransactionType";

/**
 * Controller pour les opérations de transaction
 */
export class TransactionController {
	private transferMoneyUseCase: TransferMoney;
	private transactionRepository: TransactionRepository;

	constructor() {
		const accountRepository = new AccountRepository();
		const transactionRepository = new TransactionRepository();
		this.transferMoneyUseCase = new TransferMoney(accountRepository, transactionRepository);
		this.transactionRepository = transactionRepository;
	}

	/**
	 * POST /api/transactions/transfer
	 * Effectuer un transfert d'argent
	 */
	async transfer(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const dto: TransferMoneyDTO = req.body;

			// Validation basique
			if (
				!dto.sourceAccountId ||
				!dto.destinationAccountId ||
				!dto.amount ||
				!dto.currency
			) {
				res.status(400).json({
					success: false,
					error:
						"Compte source, compte destination, montant et devise sont requis",
				});
				return;
			}

			// Vérifier que le compte source appartient bien à l'utilisateur
			const accountRepository = new AccountRepository();
			const sourceAccount = await accountRepository.findById(
				new AccountId(dto.sourceAccountId)
			);

			if (!sourceAccount) {
				res.status(404).json({
					success: false,
					error: "Compte source non trouvé",
				});
				return;
			}

			if (sourceAccount.userId.value !== userId) {
				res.status(403).json({
					success: false,
					error: "Vous ne pouvez pas effectuer de transfert depuis ce compte",
				});
				return;
			}

			const result = await this.transferMoneyUseCase.execute(dto);

			if (result.success) {
				res.status(201).json({
					success: true,
					message: "Transfert effectué avec succès",
					data: {
						transactionId: result.transactionId,
					},
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in transfer:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors du transfert",
			});
		}
	}

	/**
	 * GET /api/transactions/account/:accountId
	 * Récupérer l'historique des transactions d'un compte
	 */
	async getAccountTransactions(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;
			const accountId = req.params.accountId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			// Vérifier que le compte appartient bien à l'utilisateur
			const accountRepository = new AccountRepository();
			const account = await accountRepository.findById(new AccountId(accountId));

			if (!account) {
				res.status(404).json({
					success: false,
					error: "Compte non trouvé",
				});
				return;
			}

			if (account.userId.value !== userId) {
				res.status(403).json({
					success: false,
					error: "Accès non autorisé",
				});
				return;
			}

			// Récupérer les transactions du compte
			const transactions = await this.transactionRepository.findByAccountId(
				accountId
			);

			res.status(200).json({
				success: true,
				data: transactions.map((transaction: Transaction) => ({
					id: transaction.getId().getValue(),
					fromAccountId: transaction.getFromAccountId()?.value || null,
					toAccountId: transaction.getToAccountId()?.value || null,
					amount: transaction.getAmount().amount,
					currency: transaction.getAmount().currency,
					type: transaction.getType(),
					status: transaction.getStatus().toLowerCase(),
					description: transaction.getDescription(),
					createdAt: transaction.getCreatedAt(),
					updatedAt: transaction.getUpdatedAt(),
				})),
			});
		} catch (error) {
			console.error("Error in getAccountTransactions:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}

	/**
	 * GET /api/transfers
	 * Récupérer toutes les transactions de l'utilisateur connecté
	 */
	async getUserTransactions(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			// Récupérer toutes les transactions de l'utilisateur
			const transactions = await this.transactionRepository.findByUserId(
				userId.toString()
			);

			res.status(200).json({
				success: true,
				data: transactions.map((transaction: Transaction) => ({
					id: transaction.getId().getValue(),
					fromAccountId: transaction.getFromAccountId()?.value || null,
					toAccountId: transaction.getToAccountId()?.value || null,
					amount: transaction.getAmount().amount,
					currency: transaction.getAmount().currency,
					type: transaction.getType(),
					status: transaction.getStatus().toLowerCase(),
					description: transaction.getDescription(),
					createdAt: transaction.getCreatedAt(),
					updatedAt: transaction.getUpdatedAt(),
				})),
			});
		} catch (error) {
			console.error("Error in getUserTransactions:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}

	/**
	 * Alias pour compatibilité avec les routes
	 */
	async getTransactionsByAccount(req: Request, res: Response): Promise<void> {
		return this.getAccountTransactions(req, res);
	}

	/**
	 * GET /api/transfers/iban/lookup/:iban
	 * Récupérer les informations d'un compte par son IBAN
	 */
	async getAccountByIban(req: Request, res: Response): Promise<void> {
		try {
			const iban = req.params.iban;

			if (!iban) {
				res.status(400).json({
					success: false,
					error: "IBAN requis",
				});
				return;
			}

			// Pour l'instant, simulons une validation IBAN basique
			// En production, il faudrait valider l'IBAN et récupérer les vraies infos
			
			// Validation IBAN basique (commence par 2 lettres + 2 chiffres)
			const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}/;
			
			if (!ibanRegex.test(iban.toUpperCase())) {
				res.status(400).json({
					success: false,
					error: "Format IBAN invalide",
				});
				return;
			}

			// Simuler une réponse pour un IBAN valide
			// En production, ceci ferait appel à une API bancaire ou base de données
			res.status(200).json({
				success: true,
				data: {
					isValid: true,
					iban: iban.toUpperCase(),
					ownerName: "Destinataire Externe", // En production: récupéré depuis l'API
					bankName: "Banque Partenaire", // En production: récupéré depuis l'API
					country: iban.substring(0, 2), // Code pays depuis l'IBAN
				},
			});
		} catch (error) {
			console.error("Error in getAccountByIban:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la validation IBAN",
			});
		}
	}

	/**
	 * POST /api/transfers/iban
	 * Effectuer un transfert vers un IBAN externe
	 */
	async transferToIban(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					error: "Non authentifié",
				});
				return;
			}

			const { sourceAccountId, destinationIban, amount, currency, description } = req.body;

			// Validation basique
			if (!sourceAccountId || !destinationIban || !amount || !currency) {
				res.status(400).json({
					success: false,
					error: "Compte source, IBAN, montant et devise sont requis",
				});
				return;
			}

			// Vérifier que le compte source appartient bien à l'utilisateur
			const accountRepository = new AccountRepository();
			const sourceAccount = await accountRepository.findById(
				new AccountId(sourceAccountId)
			);

			if (!sourceAccount) {
				res.status(404).json({
					success: false,
					error: "Compte source non trouvé",
				});
				return;
			}

			if (sourceAccount.userId.value !== userId) {
				res.status(403).json({
					success: false,
					error: "Vous ne pouvez pas effectuer de transfert depuis ce compte",
				});
				return;
			}

			// Validation IBAN
			const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}/;
			if (!ibanRegex.test(destinationIban.toUpperCase())) {
				res.status(400).json({
					success: false,
					error: "Format IBAN invalide",
				});
				return;
			}

			// Vérifier que l'IBAN de destination n'appartient pas à l'utilisateur
			const userAccounts = await accountRepository.findByUserId(new UserId(userId));
			const targetAccount = userAccounts.find(account => account.iban.value === destinationIban.toUpperCase());
			
			if (targetAccount) {
				res.status(400).json({
					success: false,
					error: "Vous ne pouvez pas effectuer un virement vers votre propre compte. Utilisez un virement interne.",
				});
				return;
			}

			// Chercher le compte de destination par IBAN dans la base de données
			const destinationAccount = await accountRepository.findByIban(destinationIban.toUpperCase());
			
			// Vérifier le solde
			const amountMoney = new Money(amount, currency);
			if (!sourceAccount.hasEnoughBalance(amountMoney)) {
				res.status(400).json({
					success: false,
					error: "Solde insuffisant",
				});
				return;
			}
			
			// Débiter immédiatement le compte source
			sourceAccount.debit(amountMoney);
			await accountRepository.save(sourceAccount);

			// Créer UNE SEULE transaction en PENDING pour validation par le conseiller
			let transaction;
			let destinationAccountId = null;
			
			if (destinationAccount) {
				// Virement IBAN interne (les deux comptes sont dans notre banque)
				destinationAccountId = destinationAccount.id.value;
				
				// Description automatique avec IBAN source ET destination
				// Format: "De [IBAN_SOURCE] vers [IBAN_DEST]"
				const sourceIban = sourceAccount.iban.value;
				const destIban = destinationIban.toUpperCase();
				
				const transactionDescription = `Virement De ${sourceIban} vers ${destIban}`;
				
				transaction = Transaction.create(
					new AccountId(sourceAccountId),
					new AccountId(destinationAccountId),
					amountMoney,
					TransactionType.TRANSFER_IBAN,
					transactionDescription
				);
			} else {
				// Virement IBAN externe (compte destinataire hors de notre banque)
				const transactionDescription = `Virement vers ${destinationIban.toUpperCase()}`;
					
				transaction = Transaction.create(
					new AccountId(sourceAccountId),
					null,
					amountMoney,
					TransactionType.TRANSFER_IBAN,
					transactionDescription
				);
			}

			await this.transactionRepository.save(transaction);

			res.status(201).json({
				success: true,
				message: "Virement externe effectué avec succès",
				data: {
					transactionId: transaction.getId().getValue(),
					sourceAccountId: sourceAccountId,
					toAccountId: destinationAccountId,
					destinationIban: destinationIban.toUpperCase(),
					amount: amount,
					currency: currency,
					description: description,
					status: "completed",
					createdAt: transaction.getCreatedAt(),
				},
			});
		} catch (error) {
			console.error("Error in transferToIban:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors du virement externe",
			});
		}
	}
}
