import { IStockRepository } from "../../../Domain/repositories/IStockRepository";
import { Stock } from "../../../Domain/entities/Stock";
import { StockId } from "../../../Domain/value-objects/StockId";
import { Money } from "../../../Domain/value-objects/Money";
import { pool } from "./connection";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface StockRow extends RowDataPacket {
	id: number;
	symbol: string;
	company_name: string;
	current_price: string;
	is_available: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * Implémentation MySQL du repository Stock
 */
export class StockRepository implements IStockRepository {
	/**
	 * Sauvegarde une action (création ou mise à jour)
	 */
	async save(stock: Stock): Promise<void> {
		const connection = await pool.getConnection();

		try {
			const isNewStock = stock.id.value.includes("-"); // UUID = nouveau, nombre = existant

			if (isNewStock) {
				// Insertion d'une nouvelle action
				const [result] = await connection.execute<ResultSetHeader>(
					`INSERT INTO stocks 
                    (symbol, company_name, current_price, is_available, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NOW(), NOW())`,
					[
						stock.symbol,
						stock.companyName,
						stock.currentPrice.amount,
						stock.isAvailable,
					]
				);

				// Mettre à jour l'ID avec l'ID généré par MySQL
				(stock as any).props.id = StockId.fromNumber(result.insertId);
			} else {
				// Mise à jour d'une action existante
				await connection.execute(
					`UPDATE stocks 
                    SET symbol = ?, company_name = ?, current_price = ?, is_available = ?, updated_at = NOW()
                    WHERE id = ?`,
					[
						stock.symbol,
						stock.companyName,
						stock.currentPrice.amount,
						stock.isAvailable,
						parseInt(stock.id.value),
					]
				);
			}
		} finally {
			connection.release();
		}
	}

	/**
	 * Trouve une action par son ID
	 */
	async findById(id: StockId): Promise<Stock | null> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<StockRow[]>(
				"SELECT * FROM stocks WHERE id = ?",
				[parseInt(id.value)]
			);

			if (rows.length === 0) return null;

			return this.mapRowToStock(rows[0]);
		} finally {
			connection.release();
		}
	}

	/**
	 * Trouve une action par son symbole
	 */
	async findBySymbol(symbol: string): Promise<Stock | null> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<StockRow[]>(
				"SELECT * FROM stocks WHERE symbol = ?",
				[symbol.toUpperCase()]
			);

			if (rows.length === 0) return null;

			return this.mapRowToStock(rows[0]);
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère toutes les actions
	 */
	async findAll(availableOnly: boolean = false): Promise<Stock[]> {
		const connection = await pool.getConnection();

		try {
			const query = availableOnly
				? "SELECT * FROM stocks WHERE is_available = true ORDER BY symbol"
				: "SELECT * FROM stocks ORDER BY symbol";

			const [rows] = await connection.execute<StockRow[]>(query);

			return rows.map((row) => this.mapRowToStock(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère plusieurs actions par leurs IDs
	 */
	async findByIds(ids: StockId[]): Promise<Stock[]> {
		if (ids.length === 0) return [];

		const connection = await pool.getConnection();

		try {
			const idValues = ids.map((id) => parseInt(id.value));
			const placeholders = idValues.map(() => "?").join(",");

			const [rows] = await connection.execute<StockRow[]>(
				`SELECT * FROM stocks WHERE id IN (${placeholders}) ORDER BY symbol`,
				idValues
			);

			return rows.map((row) => this.mapRowToStock(row));
		} finally {
			connection.release();
		}
	}

	/**
	 * Supprime une action par son ID
	 */
	async delete(id: StockId): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.execute("DELETE FROM stocks WHERE id = ?", [
				parseInt(id.value),
			]);
		} finally {
			connection.release();
		}
	}

	/**
	 * Vérifie si une action existe par son symbole
	 */
	async existsBySymbol(symbol: string): Promise<boolean> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.execute<RowDataPacket[]>(
				"SELECT COUNT(*) as count FROM stocks WHERE symbol = ?",
				[symbol.toUpperCase()]
			);

			return rows[0].count > 0;
		} finally {
			connection.release();
		}
	}

	/**
	 * Convertit une ligne de base de données en entité Stock
	 */
	private mapRowToStock(row: StockRow): Stock {
		return new Stock({
			id: StockId.fromNumber(row.id),
			symbol: row.symbol,
			companyName: row.company_name,
			currentPrice: new Money(parseFloat(row.current_price)),
			isAvailable: row.is_available,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}
}
