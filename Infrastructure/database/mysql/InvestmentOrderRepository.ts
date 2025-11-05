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
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface InvestmentOrderRow extends RowDataPacket {
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
 * Implémentation MySQL du repository InvestmentOrder
 */
export class InvestmentOrderRepository implements IInvestmentOrderRepository {
	/**
	 * Sauvegarde un ordre d'investissement (création ou mise à jour)
	 */
	async save(order: InvestmentOrder): Promise<void> {
		const connection = await pool.getConnection();

		try {
			const isNewOrder = order.id.value.includes("-"); // UUID = nouveau, nombre = existant

			if (isNewOrder) {
				// Insertion d'un nouvel ordre
				const [result] = await connection.execute<ResultSetHeader>(
					`INSERT INTO investment_orders 
                    (user_id, account_id, stock_id, order_type, quantity, price_per_share, total_amount, fees, status, executed_at, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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

				// Mettre à jour l'ID avec l'ID généré par MySQL
				(order as any).props.id = InvestmentOrderId.fromNumber(result.insertId);
			} else {
				// Mise à jour d'un ordre existant
				await connection.execute(
					`UPDATE investment_orders 
                    SET user_id = ?, account_id = ?, stock_id = ?, order_type = ?, quantity = ?, 
                    price_per_share = ?, total_amount = ?, fees = ?, status = ?, executed_at = ?, updated_at = NOW()
                    WHERE id = ?`,
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
			connection.release();
		}
	}

	/**
	 * Trouve un ordre par son ID
	 */
	async findById(id: InvestmentOrderId): Promise<InvestmentOrder | null> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				"SELECT * FROM investment_orders WHERE id = ?",
				[parseInt(id.value)]
			);

			if (rows.length === 0) return null;

			return this.mapRowToInvestmentOrder(rows[0]);
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère tous les ordres d'un utilisateur
	 */
	async findByUserId(userId: UserId): Promise<InvestmentOrder[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				`SELECT 
					io.*,
					s.symbol as stock_symbol,
					s.company_name as company_name
				FROM investment_orders io
				LEFT JOIN stocks s ON io.stock_id = s.id
				WHERE io.user_id = ? 
				ORDER BY io.created_at DESC`,
				[parseInt(userId.value)]
			);

			return rows.map((row) => this.mapRowToInvestmentOrder(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère tous les ordres d'un compte
	 */
	async findByAccountId(accountId: AccountId): Promise<InvestmentOrder[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				"SELECT * FROM investment_orders WHERE account_id = ? ORDER BY created_at DESC",
				[parseInt(accountId.value)]
			);

			return rows.map((row) => this.mapRowToInvestmentOrder(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère tous les ordres pour une action donnée
	 */
	async findByStockId(stockId: StockId): Promise<InvestmentOrder[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				"SELECT * FROM investment_orders WHERE stock_id = ? ORDER BY created_at DESC",
				[parseInt(stockId.value)]
			);

			return rows.map((row) => this.mapRowToInvestmentOrder(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère tous les ordres avec un statut donné
	 */
	async findByStatus(status: OrderStatus): Promise<InvestmentOrder[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				"SELECT * FROM investment_orders WHERE status = ? ORDER BY created_at DESC",
				[status]
			);

			return rows.map((row) => this.mapRowToInvestmentOrder(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère tous les ordres en attente d'un utilisateur
	 */
	async findPendingOrdersByUserId(userId: UserId): Promise<InvestmentOrder[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				"SELECT * FROM investment_orders WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC",
				[parseInt(userId.value)]
			);

			return rows.map((row) => this.mapRowToInvestmentOrder(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère tous les ordres exécutés d'un utilisateur pour construire le portefeuille
	 */
	async findExecutedOrdersByUserId(userId: UserId): Promise<InvestmentOrder[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				"SELECT * FROM investment_orders WHERE user_id = ? AND status = 'executed' ORDER BY executed_at ASC",
				[parseInt(userId.value)]
			);

			return rows.map((row) => this.mapRowToInvestmentOrder(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Supprime un ordre par son ID
	 */
	async delete(id: InvestmentOrderId): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.execute("DELETE FROM investment_orders WHERE id = ?", [
				parseInt(id.value),
			]);
		} finally {
			connection.release();
		}
	}

	/**
	 * Compte le nombre d'ordres pour un utilisateur donné
	 */
	async countByUserId(userId: UserId): Promise<number> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<RowDataPacket[]>(
				"SELECT COUNT(*) as count FROM investment_orders WHERE user_id = ?",
				[parseInt(userId.value)]
			);

			return rows[0].count;
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère l'historique des ordres pour une action avec pagination
	 */
	async findStockOrderHistory(
		stockId: StockId,
		limit: number = 50,
		offset: number = 0
	): Promise<InvestmentOrder[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<InvestmentOrderRow[]>(
				"SELECT * FROM investment_orders WHERE stock_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
				[parseInt(stockId.value), limit, offset]
			);

			return rows.map((row) => this.mapRowToInvestmentOrder(row));
		} finally {
			connection.release();
		}
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
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<RowDataPacket[]>(
				`SELECT 
                    SUM(CASE WHEN order_type = 'buy' THEN quantity ELSE 0 END) as total_bought,
                    SUM(CASE WHEN order_type = 'sell' THEN quantity ELSE 0 END) as total_sold
                FROM investment_orders 
                WHERE stock_id = ? AND status = 'executed'`,
				[parseInt(stockId.value)]
			);

			const totalBought = rows[0]?.total_bought || 0;
			const totalSold = rows[0]?.total_sold || 0;

			return totalBought - totalSold;
		} finally {
			connection.release();
		}
	}
}
