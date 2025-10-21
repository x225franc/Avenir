import { pool } from "@infrastructure/database/mysql/connection";
import { RowDataPacket } from "mysql2";

/**
 * Service de fluctuation automatique des prix des actions
 * 
 * Ce service fait varier les prix des actions de manière aléatoire
 * pour simuler un marché boursier dynamique.
 * 
 * Variation : entre -2% et +2% par mise à jour
 * Fréquence : toutes les 30 secondes
 */
export class StockPriceFluctuationService {
	private intervalId: NodeJS.Timeout | null = null;
	private readonly FLUCTUATION_INTERVAL = 30000; // 30 secondes
	private readonly MIN_VARIATION = -0.01; // -1%
	private readonly MAX_VARIATION = 0.01; // + 1%

	/**
	 * Démarrer le service de fluctuation
	 */
	public start(): void {
		if (this.intervalId) {
			console.warn("⚠️ Le service de fluctuation est déjà actif");
			return;
		}

		console.log("🚀 Démarrage du service de fluctuation des prix...");
		
		// Première mise à jour immédiate
		this.updateAllStockPrices();

		// Puis mise à jour toutes les 30 secondes
		this.intervalId = setInterval(() => {
			this.updateAllStockPrices();
		}, this.FLUCTUATION_INTERVAL);

		console.log(`✅ Service de fluctuation actif (mise à jour toutes les ${this.FLUCTUATION_INTERVAL / 1000}s)`);
	}

	/**
	 * Arrêter le service de fluctuation
	 */
	public stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			console.log("🛑 Service de fluctuation arrêté");
		}
	}

	/**
	 * Mettre à jour les prix de toutes les actions disponibles
	 */
	private async updateAllStockPrices(): Promise<void> {
		try {
			// Récupérer toutes les actions disponibles
			const [stocks] = await pool.execute<RowDataPacket[]>(
				"SELECT id, symbol, current_price FROM stocks WHERE is_available = TRUE"
			);

			if (stocks.length === 0) {
				console.log("ℹ️ Aucune action disponible à mettre à jour");
				return;
			}

			// Mettre à jour chaque action
			for (const stock of stocks) {
				await this.updateStockPrice(
					stock.id,
					stock.symbol,
					parseFloat(stock.current_price)
				);
			}

			console.log(`📊 ${stocks.length} action(s) mise(s) à jour à ${new Date().toLocaleTimeString()}`);
		} catch (error) {
			console.error("❌ Erreur lors de la mise à jour des prix:", error);
		}
	}

	/**
	 * Mettre à jour le prix d'une action spécifique
	 */
	private async updateStockPrice(
		stockId: number,
		symbol: string,
		currentPrice: number
	): Promise<void> {
		try {
			// Générer une variation aléatoire entre -2% et +2%
			const variation = this.MIN_VARIATION + 
				Math.random() * (this.MAX_VARIATION - this.MIN_VARIATION);
			
			// Calculer le nouveau prix
			const newPrice = currentPrice * (1 + variation);
			
			// S'assurer que le prix reste positif et réaliste
			const finalPrice = Math.max(0.01, Number(newPrice.toFixed(4)));
			
			// Mettre à jour le prix dans la table stocks
			await pool.execute(
				"UPDATE stocks SET current_price = ?, updated_at = NOW() WHERE id = ?",
				[finalPrice, stockId]
			);

			// Enregistrer dans l'historique
			await pool.execute(
				`INSERT INTO stock_price_history (stock_id, price) VALUES (?, ?)`,
				[stockId, finalPrice]
			);

			// Log détaillé (optionnel, commenter en production)
			const variationPercent = (variation * 100).toFixed(2);
			const arrow = variation >= 0 ? "📈" : "📉";
			console.log(
				`${arrow} ${symbol}: ${currentPrice.toFixed(4)}€ → ${finalPrice.toFixed(4)}€ (${variation >= 0 ? '+' : ''}${variationPercent}%)`
			);
		} catch (error) {
			console.error(`❌ Erreur mise à jour ${symbol}:`, error);
		}
	}

	/**
	 * Obtenir l'historique des prix d'une action
	 */
	public async getPriceHistory(
		stockId: number,
		limit: number = 100
	): Promise<{ price: number; timestamp: Date }[]> {
		try {
			const [rows] = await pool.execute<RowDataPacket[]>(
				`SELECT price, timestamp 
				 FROM stock_price_history 
				 WHERE stock_id = ? 
				 ORDER BY timestamp DESC 
				 LIMIT ?`,
				[stockId, limit]
			);

			return rows.map(row => ({
				price: parseFloat(row.price),
				timestamp: new Date(row.timestamp)
			}));
		} catch (error) {
			console.error("❌ Erreur récupération historique:", error);
			return [];
		}
	}

	/**
	 * Nettoyer l'ancien historique (garder seulement les 30 derniers jours)
	 */
	public async cleanOldHistory(): Promise<void> {
		try {
			const [result] = await pool.execute(
				`DELETE FROM stock_price_history 
				 WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY)`
			);

			console.log(`🧹 Historique nettoyé (${(result as any).affectedRows} entrées supprimées)`);
		} catch (error) {
			console.error("❌ Erreur nettoyage historique:", error);
		}
	}
}

// Instance singleton du service
export const stockPriceFluctuationService = new StockPriceFluctuationService();
