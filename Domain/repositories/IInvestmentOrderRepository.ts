import { InvestmentOrder, OrderStatus } from "../entities/InvestmentOrder";
import { InvestmentOrderId } from "../value-objects/InvestmentOrderId";
import { UserId } from "../value-objects/UserId";
import { AccountId } from "../value-objects/AccountId";
import { StockId } from "../value-objects/StockId";

/**
 * Interface du repository pour les ordres d'investissement
 */
export interface IInvestmentOrderRepository {
	/**
	 * Sauvegarde un ordre d'investissement (création ou mise à jour)
	 */
	save(order: InvestmentOrder): Promise<void>;

	/**
	 * Trouve un ordre par son ID
	 */
	findById(id: InvestmentOrderId): Promise<InvestmentOrder | null>;

	/**
	 * Récupère tous les ordres d'un utilisateur
	 */
	findByUserId(userId: UserId): Promise<InvestmentOrder[]>;

	/**
	 * Récupère tous les ordres d'un compte
	 */
	findByAccountId(accountId: AccountId): Promise<InvestmentOrder[]>;

	/**
	 * Récupère tous les ordres pour une action donnée
	 */
	findByStockId(stockId: StockId): Promise<InvestmentOrder[]>;

	/**
	 * Récupère tous les ordres avec un statut donné
	 */
	findByStatus(status: OrderStatus): Promise<InvestmentOrder[]>;

	/**
	 * Récupère tous les ordres en attente d'un utilisateur
	 */
	findPendingOrdersByUserId(userId: UserId): Promise<InvestmentOrder[]>;

	/**
	 * Récupère tous les ordres exécutés d'un utilisateur pour construire le portefeuille
	 */
	findExecutedOrdersByUserId(userId: UserId): Promise<InvestmentOrder[]>;

	/**
	 * Supprime un ordre par son ID
	 */
	delete(id: InvestmentOrderId): Promise<void>;

	/**
	 * Compte le nombre d'ordres pour un utilisateur donné
	 */
	countByUserId(userId: UserId): Promise<number>;

	/**
	 * Récupère l'historique des ordres pour une action avec pagination
	 */
	findStockOrderHistory(
		stockId: StockId,
		limit?: number,
		offset?: number
	): Promise<InvestmentOrder[]>;
}
