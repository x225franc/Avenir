import { Transaction } from "../entities/Transaction";

/**
 * Interface du repository Transaction (contrat du domaine)
 */
export interface ITransactionRepository {
	/**
	 * Sauvegarde une transaction (création ou mise à jour)
	 */
	save(transaction: Transaction): Promise<void>;

	/**
	 * Trouve une transaction par son ID
	 */
	findById(id: string): Promise<Transaction | null>;

	/**
	 * Trouve toutes les transactions d'un compte
	 */
	findByAccountId(accountId: string): Promise<Transaction[]>;

	/**
	 * Trouve toutes les transactions d'un utilisateur
	 */
	findByUserId(userId: string): Promise<Transaction[]>;
}
