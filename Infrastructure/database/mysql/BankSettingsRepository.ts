import { IBankSettingsRepository } from "../../../Domain/repositories/IBankSettingsRepository";
import { pool } from "./connection";

/**
 * Implémentation MySQL du repository BankSettings
 */
export class BankSettingsRepository implements IBankSettingsRepository {

	/**
	 * Récupère la valeur d'un paramètre
	 */
	async getSetting(key: string): Promise<string | null> {
		const connection = await pool.getConnection();
		
		try {
			const [rows] = await connection.execute(
				'SELECT setting_value FROM bank_settings WHERE setting_key = ?',
				[key]
			);

			const results = rows as any[];
			return results.length > 0 ? results[0].setting_value : null;
		} finally {
			connection.release();
		}
	}

	/**
	 * Définit la valeur d'un paramètre
	 */
	async setSetting(key: string, value: string): Promise<void> {
		const connection = await pool.getConnection();
		
		try {
			await connection.execute(
				`INSERT INTO bank_settings (setting_key, setting_value, updated_at) 
				VALUES (?, ?, NOW()) 
				ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
				[key, value, value]
			);
		} finally {
			connection.release();
		}
	}

	/**
	 * Récupère le taux d'épargne actuel
	 */
	async getSavingsRate(): Promise<number> {
		const rateStr = await this.getSetting('savings_interest_rate');
		return rateStr ? parseFloat(rateStr) : 2.5; // Défaut: 2.5%
	}

	/**
	 * Définit le taux d'épargne
	 */
	async setSavingsRate(rate: number): Promise<void> {
		await this.setSetting('savings_interest_rate', rate.toString());
	}

	/**
	 * Récupère les frais d'investissement actuels
	 */
	async getInvestmentFee(): Promise<number> {
		const feeStr = await this.getSetting('investment_fee');
		return feeStr ? parseFloat(feeStr) : 1.00; // Défaut: 1€
	}

	/**
	 * Définit les frais d'investissement
	 */
	async setInvestmentFee(fee: number): Promise<void> {
		await this.setSetting('investment_fee', fee.toString());
	}
}