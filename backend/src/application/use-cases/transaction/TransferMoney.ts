import { IAccountRepository } from "@domain/repositories/IAccountRepository";
import { pool } from "@infrastructure/database/mysql/connection";
import { AccountId } from "@domain/value-objects/AccountId";
import { Money } from "@domain/value-objects/Money";
import { IBAN } from "@domain/value-objects/IBAN";
import { TransferMoneyDTO } from "../../dto";

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
	constructor(private accountRepository: IAccountRepository) {}

	async execute(dto: TransferMoneyDTO): Promise<TransferMoneyResult> {
		const connection = await pool.getConnection();

		try {
			// Démarrer une transaction SQL
			await connection.beginTransaction();

			// 1. Valider les données
			const sourceAccountId = new AccountId(dto.sourceAccountId);
			const destinationIBAN = new IBAN(dto.destinationIBAN);
			const amount = new Money(dto.amount, dto.currency);

			// 2. Vérifier que le montant est positif
			if (amount.amount <= 0) {
				await connection.rollback();
				return {
					success: false,
					error: "Le montant du transfert doit être positif",
				};
			}

			// 3. Récupérer le compte source
			const sourceAccount = await this.accountRepository.findById(
				sourceAccountId
			);
			if (!sourceAccount) {
				await connection.rollback();
				return {
					success: false,
					error: "Compte source non trouvé",
				};
			}

			if (!sourceAccount.isActive) {
				await connection.rollback();
				return {
					success: false,
					error: "Le compte source est inactif",
				};
			}

			// 4. Récupérer le compte destination
			const destinationAccount = await this.accountRepository.findByIBAN(
				destinationIBAN
			);
			if (!destinationAccount) {
				await connection.rollback();
				return {
					success: false,
					error: "Compte destination non trouvé",
				};
			}

			if (!destinationAccount.isActive) {
				await connection.rollback();
				return {
					success: false,
					error: "Le compte destination est inactif",
				};
			}

			// 5. Vérifier que ce ne sont pas le même compte
			if (sourceAccount.id.equals(destinationAccount.id)) {
				await connection.rollback();
				return {
					success: false,
					error: "Impossible de transférer vers le même compte",
				};
			}

			// 6. Vérifier le solde suffisant
			if (!sourceAccount.hasEnoughBalance(amount)) {
				await connection.rollback();
				return {
					success: false,
					error: "Solde insuffisant",
				};
			}

			// 7. Effectuer le transfert (débiter source + créditer destination)
			sourceAccount.debit(amount);
			destinationAccount.credit(amount);

			// 8. Sauvegarder les deux comptes
			await this.accountRepository.save(sourceAccount);
			await this.accountRepository.save(destinationAccount);

			// 9. Créer l'enregistrement de transaction
			const transactionId = this.generateTransactionId();
			await connection.execute(
				`INSERT INTO transactions 
				(id, source_account_id, destination_account_id, amount, currency, description, status, created_at)
				VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW())`,
				[
					transactionId,
					sourceAccount.id.value,
					destinationAccount.id.value,
					amount.amount,
					amount.currency,
					dto.description || "Transfert",
				]
			);

			// 10. Valider la transaction SQL
			await connection.commit();

			return {
				success: true,
				transactionId,
			};
		} catch (error) {
			// En cas d'erreur, annuler la transaction
			await connection.rollback();

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
		} finally {
			connection.release();
		}
	}

	/**
	 * Génère un ID unique pour la transaction
	 */
	private generateTransactionId(): string {
		return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
	}
}
