import { Credit } from "../entities/Credit";
import { CreditId } from "../value-objects/CreditId";
import { UserId } from "../value-objects/UserId";

/**
 * Interface du repository pour les crédits
 */
export interface ICreditRepository {
	/**
	 * Sauvegarde un crédit (création ou mise à jour)
	 */
	save(credit: Credit): Promise<void>;

	/**
	 * Trouve un crédit par son ID
	 */
	findById(id: CreditId): Promise<Credit | null>;

	/**
	 * Trouve tous les crédits d'un utilisateur
	 */
	findByUserId(userId: UserId): Promise<Credit[]>;

	/**
	 * Trouve tous les crédits gérés par un conseiller
	 */
	findByAdvisorId(advisorId: UserId): Promise<Credit[]>;

	/**
	 * Trouve tous les crédits actifs
	 */
	findActiveCredits(): Promise<Credit[]>;

	/**
	 * Met à jour un crédit existant
	 */
	update(credit: Credit): Promise<void>;

	/**
	 * Supprime un crédit
	 */
	delete(id: CreditId): Promise<void>;
}
