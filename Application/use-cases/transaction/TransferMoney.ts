import { IAccountRepository } from "@domain/repositories/IAccountRepository";
import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";
import { AccountId } from "@domain/value-objects/AccountId";
import { Money } from "@domain/value-objects/Money";
import { Transaction } from "@domain/entities/Transaction";
import { TransactionType } from "@domain/enums/TransactionType";

export interface TransferMoneyDTO {
	sourceAccountId: string;
	destinationAccountId: string;
	amount: number;
	currency: string;
	description?: string;
}

export interface TransferMoneyResult {
	success: boolean;
	transactionId?: string;
	error?: string;
}

/**
 * Use Case: Transfert d'argent entre deux comptes
 * 
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que le compte source existe et est actif
 * - Vérifier que le compte destination existe et est actif
 * - Vérifier que le solde est suffisant
 * - Débiter le compte source
 * - Créditer le compte destination
 * - Enregistrer la transaction (dans une transaction SQL pour garantir l'atomicité)
 * 
 * Important: Utilise une transaction SQL pour garantir que les deux opérations
 * (débit + crédit) sont atomiques (tout ou rien)
 */
export class TransferMoney {
	constructor(
		private accountRepository: IAccountRepository,
		private transactionRepository: ITransactionRepository
	) {}

	async execute(dto: TransferMoneyDTO): Promise<TransferMoneyResult> {
		try {
			// Valider les données
			const sourceAccountId = new AccountId(dto.sourceAccountId);
			const destinationAccountId = new AccountId(dto.destinationAccountId);
			const amount = new Money(dto.amount, dto.currency);

			// Vérifier que le montant est positif
			if (amount.amount <= 0) {
				return {
					success: false,
					error: "Le montant du transfert doit être positif",
				};
			}

			// Récupérer le compte source
			const sourceAccount = await this.accountRepository.findById(
				sourceAccountId
			);
			if (!sourceAccount) {
				return {
					success: false,
					error: "Compte source non trouvé",
				};
			}

			if (!sourceAccount.isActive) {
				return {
					success: false,
					error: "Le compte source est inactif",
				};
			}

			// Récupérer le compte destination
			const destinationAccount = await this.accountRepository.findById(
				destinationAccountId
			);
			if (!destinationAccount) {
				return {
					success: false,
					error: "Compte destination non trouvé",
				};
			}

			if (!destinationAccount.isActive) {
				return {
					success: false,
					error: "Le compte destination est inactif",
				};
			}

			// Vérifier que ce ne sont pas le même compte
			if (sourceAccount.id.equals(destinationAccount.id)) {
				return {
					success: false,
					error: "Impossible de transférer vers le même compte",
				};
			}

			// Vérifier le solde suffisant
			if (!sourceAccount.hasEnoughBalance(amount)) {
				return {
					success: false,
					error: "Solde insuffisant",
				};
			}

			// Créer la transaction
			const transaction = Transaction.create(
				sourceAccount.id,
				destinationAccount.id,
				amount,
				TransactionType.TRANSFER,
				dto.description || "Transfert"
			);

			// Sauvegarder l'ID de la transaction avant les opérations
			const transactionId = transaction.getId().toString();

			// Effectuer le transfert (débiter source + créditer destination)
			sourceAccount.debit(amount);
			destinationAccount.credit(amount);

			// Sauvegarder (dans cet ordre : transaction, puis comptes)
			await this.transactionRepository.save(transaction);
			await this.accountRepository.save(sourceAccount);
			await this.accountRepository.save(destinationAccount);

			// Marquer la transaction comme complétée
			transaction.complete();
			await this.transactionRepository.save(transaction);
			return {
				success: true,
				transactionId: transactionId,
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
				error: "Une erreur inattendue s'est produite lors du transfert",
			};
		}
	}
}
