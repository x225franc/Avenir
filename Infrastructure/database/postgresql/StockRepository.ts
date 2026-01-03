import { IStockRepository } from "../../../Domain/repositories/IStockRepository";
import { Stock } from "../../../Domain/entities/Stock";
import { StockId } from "../../../Domain/value-objects/StockId";
import { Money } from "../../../Domain/value-objects/Money";
import { pool } from "./connection";

interface StockRow {
	id: number;
	symbol: string;
	company_name: string;
	current_price: string;
	is_available: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * Implémentation PostgreSQL du repository Stock
 */
export class StockRepository implements IStockRepository {
	/**
	 * Sauvegarde une action (création ou mise à jour)
	 */
	async save(stock: Stock): Promise<void> {
		const client = await pool.connect();

		try {
			const isNewStock = stock.id.value.includes("-"); // UUID = nouveau, nombre = existant

			if (isNewStock) {
				// Insertion d'une nouvelle action
				const result = await client.query(
					`INSERT INTO stocks 
                    (symbol, company_name, current_price, is_available, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING id`,
					[
						stock.symbol,
						stock.companyName,
						stock.currentPrice.amount,
						stock.isAvailable,
					]
				);

				// Mettre à jour l'ID avec l'ID généré par PostgreSQL
				(stock as any).props.id = StockId.fromNumber(result.rows[0].id);
			} else {
				// Mise à jour d'une action existante
				await client.query(
					`UPDATE stocks 
                    SET symbol = $1, company_name = $2, current_price = $3, is_available = $4, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $5`,
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
			client.release();
		}
	}

	/**
	 * Trouve une action par son ID
	 */
	async findById(id: StockId): Promise<Stock | null> {
		const result = await pool.query(
			"SELECT * FROM stocks WHERE id = $1",
			[parseInt(id.value)]
		);

		if (result.rows.length === 0) return null;

		return this.mapRowToStock(result.rows[0]);
	}

	/**
	 * Trouve une action par son symbole
	 */
	async findBySymbol(symbol: string): Promise<Stock | null> {
		const result = await pool.query(
			"SELECT * FROM stocks WHERE symbol = $1",
			[symbol.toUpperCase()]
		);

		if (result.rows.length === 0) return null;

		return this.mapRowToStock(result.rows[0]);
	}

	/**
	 * Récupère toutes les actions
	 */
	async findAll(availableOnly: boolean = false): Promise<Stock[]> {
		const query = availableOnly
			? "SELECT * FROM stocks WHERE is_available = true ORDER BY symbol"
			: "SELECT * FROM stocks ORDER BY symbol";

		const result = await pool.query(query);

		return result.rows.map((row) => this.mapRowToStock(row));
	}

	/**
	 * Récupère plusieurs actions par leurs IDs
	 */
	async findByIds(ids: StockId[]): Promise<Stock[]> {
		if (ids.length === 0) return [];

		const idValues = ids.map((id) => parseInt(id.value));
		const placeholders = idValues.map((_, index) => `$${index + 1}`).join(",");

		const result = await pool.query(
			`SELECT * FROM stocks WHERE id = ANY($1) ORDER BY symbol`,
			[idValues]
		);

		return result.rows.map((row) => this.mapRowToStock(row));
	}

	/**
	 * Supprime une action par son ID
	 */
	async delete(id: StockId): Promise<void> {
		await pool.query("DELETE FROM stocks WHERE id = $1", [
			parseInt(id.value),
		]);
	}

	/**
	 * Vérifie si une action existe par son symbole
	 */
	async existsBySymbol(symbol: string): Promise<boolean> {
		const result = await pool.query(
			"SELECT COUNT(*) as count FROM stocks WHERE symbol = $1",
			[symbol.toUpperCase()]
		);

		return parseInt(result.rows[0].count) > 0;
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