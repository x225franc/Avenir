import { IInvestmentOrderRepository } from "../../../Domain/repositories/IInvestmentOrderRepository";
import {
	InvestmentOrder,
	OrderType,
	OrderStatus,
} from "../../../Domain/entities/InvestmentOrder";
import { InvestmentOrderId } from "../../../Domain/value-objects/InvestmentOrderId";
import { UserId } from "../../../Domain/value-objects/UserId";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { StockId } from "../../../Domain/value-objects/StockId";
import { Money } from "../../../Domain/value-objects/Money";
import { pool } from "./connection";

interface InvestmentOrderRow {
	id: number;
	user_id: number;
	account_id: number;
	stock_id: number;
	order_type: "buy" | "sell";
	quantity: number;
	price_per_share: string;
	total_amount: string;
	fees: string;
	status: "pending" | "executed" | "cancelled";
	executed_at: Date | null;
	created_at: Date;
	updated_at: Date;
	// Champs optionnels pour le JOIN avec stocks
	stock_symbol?: string;
	company_name?: string;
}

/**
 * Implémentation PostgreSQL du repository InvestmentOrder
 */
export class InvestmentOrderRepository implements IInvestmentOrderRepository {
	/**
	 * Sauvegarde un ordre d'investissement (création ou mise à jour)
	 */
	async save(order: InvestmentOrder): Promise<void> {
		const client = await pool.connect();

		try {
			const isNewOrder = order.id.value.includes("-"); // UUID = nouveau, nombre = existant

			if (isNewOrder) {
				// Insertion d'un nouvel ordre
				const result = await client.query(
					`INSERT INTO investment_orders 
                    (user_id, account_id, stock_id, order_type, quantity, price_per_share, total_amount, fees, status, executed_at, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING id`,
					[
						parseInt(order.userId.value),
						parseInt(order.accountId.value),
						parseInt(order.stockId.value),
						order.orderType,
						order.quantity,
						order.pricePerShare.amount,
						order.totalAmount.amount,
						order.fees.amount,
						order.status,
						order.executedAt,
					]
				);

				// Mettre à jour l'ID avec l'ID généré par PostgreSQL
				(order as any).props.id = InvestmentOrderId.fromNumber(result.rows[0].id);
			} else {
				// Mise à jour d'un ordre existant
				await client.query(
					`UPDATE investment_orders 
                    SET user_id = $1, account_id = $2, stock_id = $3, order_type = $4, quantity = $5, 
                    price_per_share = $6, total_amount = $7, fees = $8, status = $9, executed_at = $10, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $11`,
					[
						parseInt(order.userId.value),
						parseInt(order.accountId.value),
						parseInt(order.stockId.value),
						order.orderType,
						order.quantity,
						order.pricePerShare.amount,
						order.totalAmount.amount,
						order.fees.amount,
						order.status,
						order.executedAt,
						parseInt(order.id.value),
					]
				);
			}
		} finally {
			client.release();
		}
	}

	/**
	 * Trouve un ordre par son ID
	 */
	async findById(id: InvestmentOrderId): Promise<InvestmentOrder | null> {
		const result = await pool.query(
			"SELECT * FROM investment_orders WHERE id = $1",
			[parseInt(id.value)]
		);

		if (result.rows.length === 0) return null;

		return this.mapRowToInvestmentOrder(result.rows[0]);
	}

	/**
	 * Récupère tous les ordres d'un utilisateur
	 */
	async findByUserId(userId: UserId): Promise<InvestmentOrder[]> {
		const result = await pool.query(
			`SELECT 
				io.*,
				s.symbol as stock_symbol,
				s.company_name as company_name
			FROM investment_orders io
			LEFT JOIN stocks s ON io.stock_id = s.id
			WHERE io.user_id = $1 
			ORDER BY io.created_at DESC`,
			[parseInt(userId.value)]
		);

		return result.rows.map((row) => this.mapRowToInvestmentOrder(row));
	}

	/**
	 * Récupère tous les ordres d'un compte
	 */
	async findByAccountId(accountId: AccountId): Promise<InvestmentOrder[]> {
		const result = await pool.query(
			"SELECT * FROM investment_orders WHERE account_id = $1 ORDER BY created_at DESC",
			[parseInt(accountId.value)]
		);

		return result.rows.map((row) => this.mapRowToInvestmentOrder(row));
	}

	/**
	 * Récupère tous les ordres pour une action donnée
	 */
	async findByStockId(stockId: StockId): Promise<InvestmentOrder[]> {
		const result = await pool.query(
			"SELECT * FROM investment_orders WHERE stock_id = $1 ORDER BY created_at DESC",
			[parseInt(stockId.value)]
		);

		return result.rows.map((row) => this.mapRowToInvestmentOrder(row));
	}

	/**
	 * Récupère tous les ordres avec un statut donné
	 */
	async findByStatus(status: OrderStatus): Promise<InvestmentOrder[]> {
		const result = await pool.query(
			"SELECT * FROM investment_orders WHERE status = $1 ORDER BY created_at DESC",
			[status]
		);

		return result.rows.map((row) => this.mapRowToInvestmentOrder(row));
	}

	/**
	 * Récupère tous les ordres en attente d'un utilisateur
	 */
	async findPendingOrdersByUserId(userId: UserId): Promise<InvestmentOrder[]> {
		const result = await pool.query(
			"SELECT * FROM investment_orders WHERE user_id = $1 AND status = 'pending' ORDER BY created_at DESC",
			[parseInt(userId.value)]
		);

		return result.rows.map((row) => this.mapRowToInvestmentOrder(row));
	}

	/**
	 * Récupère tous les ordres exécutés d'un utilisateur pour construire le portefeuille
	 */
	async findExecutedOrdersByUserId(userId: UserId): Promise<InvestmentOrder[]> {
		const result = await pool.query(
			"SELECT * FROM investment_orders WHERE user_id = $1 AND status = 'executed' ORDER BY executed_at ASC",
			[parseInt(userId.value)]
		);

		return result.rows.map((row) => this.mapRowToInvestmentOrder(row));
	}

	/**
	 * Supprime un ordre par son ID
	 */
	async delete(id: InvestmentOrderId): Promise<void> {
		await pool.query("DELETE FROM investment_orders WHERE id = $1", [
			parseInt(id.value),
		]);
	}

	/**
	 * Compte le nombre d'ordres pour un utilisateur donné
	 */
	async countByUserId(userId: UserId): Promise<number> {
		const result = await pool.query(
			"SELECT COUNT(*) as count FROM investment_orders WHERE user_id = $1",
			[parseInt(userId.value)]
		);

		return parseInt(result.rows[0].count);
	}

	/**
	 * Récupère l'historique des ordres pour une action avec pagination
	 */
	async findStockOrderHistory(
		stockId: StockId,
		limit: number = 50,
		offset: number = 0
	): Promise<InvestmentOrder[]> {
		const result = await pool.query(
			"SELECT * FROM investment_orders WHERE stock_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
			[parseInt(stockId.value), limit, offset]
		);

		return result.rows.map((row) => this.mapRowToInvestmentOrder(row));
	}

	/**
	 * Convertit une ligne de base de données en entité InvestmentOrder
	 */
	private mapRowToInvestmentOrder(row: InvestmentOrderRow): InvestmentOrder {
		return new InvestmentOrder({
			id: InvestmentOrderId.fromNumber(row.id),
			userId: new UserId(row.user_id.toString()),
			accountId: new AccountId(row.account_id.toString()),
			stockId: StockId.fromNumber(row.stock_id),
			orderType: row.order_type === "buy" ? OrderType.BUY : OrderType.SELL,
			quantity: row.quantity,
			pricePerShare: new Money(parseFloat(row.price_per_share)),
			totalAmount: new Money(parseFloat(row.total_amount)),
			fees: new Money(parseFloat(row.fees)),
			status: this.mapStatus(row.status),
			executedAt: row.executed_at || undefined,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			stockSymbol: row.stock_symbol,
			companyName: row.company_name,
		});
	}

	private mapStatus(status: string): OrderStatus {
		switch (status) {
			case "pending":
				return OrderStatus.PENDING;
			case "executed":
				return OrderStatus.EXECUTED;
			case "cancelled":
				return OrderStatus.CANCELLED;
			default:
				throw new Error(`Unknown order status: ${status}`);
		}
	}

	/**
	 * Calcule le nombre net d'actions détenues par tous les utilisateurs
	 * pour une action donnée (achats - ventes exécutés uniquement)
	 */
	async countNetHoldingsByStockId(stockId: StockId): Promise<number> {
		const result = await pool.query(
			`SELECT 
                SUM(CASE WHEN order_type = 'buy' THEN quantity ELSE 0 END) as total_bought,
                SUM(CASE WHEN order_type = 'sell' THEN quantity ELSE 0 END) as total_sold
            FROM investment_orders 
            WHERE stock_id = $1 AND status = 'executed'`,
			[parseInt(stockId.value)]
		);

		const totalBought = result.rows[0]?.total_bought || 0;
		const totalSold = result.rows[0]?.total_sold || 0;

		return totalBought - totalSold;
	}
}