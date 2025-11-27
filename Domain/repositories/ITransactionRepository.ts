import { Transaction } from "../entities/Transaction";
import { TransactionId } from "../value-objects/TransactionId";

/**
 * Interface du repository pour les transactions
 */
export interface ITransactionRepository {
	/**
	 * Sauvegarde une transaction (création ou mise à jour)
	 */
	save(transaction: Transaction): Promise<void>;

	/**
	 * Trouve une transaction par son ID
	 */
	findById(id: TransactionId): Promise<Transaction | null>;

	/**
	 * Trouve toutes les transactions d'un compte
	 */
	findByAccountId(accountId: string): Promise<Transaction[]>;

	/**
	 * Trouve toutes les transactions d'un utilisateur
	 */
	findByUserId(userId: string): Promise<Transaction[]>;

	/**
	 * Trouve toutes les transactions
	 */
	findAll(): Promise<Transaction[]>;

	/**
	 * Trouve les transactions par statut
	 */
	findByStatus(status: string): Promise<Transaction[]>;

	/**
	 * Met à jour une transaction existante
	 */
	update(transaction: Transaction): Promise<void>;

	/**
	 * Supprime une transaction
	 */
	delete(id: TransactionId): Promise<void>;
}
