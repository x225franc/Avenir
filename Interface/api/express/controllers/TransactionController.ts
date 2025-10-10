import { Request, Response } from "express";
import { TransferMoney } from "@application/use-cases";
import { AccountRepository } from "@infrastructure/database/mysql/AccountRepository";
import { TransferMoneyDTO } from "@application/dto";

/**
 * Controller pour les opérations de transaction
 */
export class TransactionController {
	private transferMoneyUseCase: TransferMoney;

	constructor() {
		const accountRepository = new AccountRepository();
		this.transferMoneyUseCase = new TransferMoney(accountRepository);
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
				!dto.destinationIBAN ||
				!dto.amount ||
				!dto.currency
			) {
				res.status(400).json({
					success: false,
					error:
						"Compte source, IBAN destination, montant et devise sont requis",
				});
				return;
			}

			// Vérifier que le compte source appartient bien à l'utilisateur
			const accountRepository = new AccountRepository();
			const sourceAccount = await accountRepository.findById(
				dto.sourceAccountId as any
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
			const account = await accountRepository.findById(accountId as any);

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

			// TODO: Implémenter la récupération des transactions
			// Pour l'instant, on retourne un tableau vide
			res.status(200).json({
				success: true,
				data: [],
				message: "Fonctionnalité à implémenter",
			});
		} catch (error) {
			console.error("Error in getAccountTransactions:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur",
			});
		}
	}
}
