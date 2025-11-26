import { Credit } from "../entities/Credit";
import { CreditId } from "../value-objects/CreditId";
import { UserId } from "../value-objects/UserId";

/**
 * Repository Interface : ICreditRepository
 * Définit les opérations de persistance pour les crédits
 */
export interface ICreditRepository {
	save(credit: Credit): Promise<void>;
	findById(id: CreditId): Promise<Credit | null>;
	findByUserId(userId: UserId): Promise<Credit[]>;
	findByAdvisorId(advisorId: UserId): Promise<Credit[]>;
	findActiveCredits(): Promise<Credit[]>;
	update(credit: Credit): Promise<void>;
	delete(id: CreditId): Promise<void>;
}
