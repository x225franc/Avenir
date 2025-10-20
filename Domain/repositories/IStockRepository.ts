import { Stock } from "../entities/Stock";
import { StockId } from "../value-objects/StockId";

/**
 * Interface du repository pour les actions (Stock)
 */
export interface IStockRepository {
	/**
	 * Sauvegarde une action (création ou mise à jour)
	 */
	save(stock: Stock): Promise<void>;

	/**
	 * Trouve une action par son ID
	 */
	findById(id: StockId): Promise<Stock | null>;

	/**
	 * Trouve une action par son symbole
	 */
	findBySymbol(symbol: string): Promise<Stock | null>;

	/**
	 * Récupère toutes les actions disponibles
	 * @param availableOnly - Si true, ne retourne que les actions disponibles
	 */
	findAll(availableOnly?: boolean): Promise<Stock[]>;

	/**
	 * Récupère plusieurs actions par leurs IDs
	 */
	findByIds(ids: StockId[]): Promise<Stock[]>;

	/**
	 * Supprime une action par son ID
	 */
	delete(id: StockId): Promise<void>;

	/**
	 * Vérifie si une action existe par son symbole
	 */
	existsBySymbol(symbol: string): Promise<boolean>;
}
