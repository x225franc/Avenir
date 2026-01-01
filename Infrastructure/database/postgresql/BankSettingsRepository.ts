import { IBankSettingsRepository } from "../../../Domain/repositories/IBankSettingsRepository";
import { pool } from "./connection";

/**
 * Implémentation PostgreSQL du repository BankSettings
 */
export class BankSettingsRepository implements IBankSettingsRepository {

	/**
	 * Récupère la valeur d'un paramètre
	 */
	async getSetting(key: string): Promise<string | null> {
		const client = await pool.connect();
		
		try {
			const result = await client.query(
				'SELECT setting_value FROM bank_settings WHERE setting_key = $1',
				[key]
			);

			return result.rows.length > 0 ? result.rows[0].setting_value : null;
		} finally {
			client.release();
		}
	}

	/**
	 * Définit la valeur d'un paramètre
	 */
	async setSetting(key: string, value: string): Promise<void> {
		const client = await pool.connect();
		
		try {
			await client.query(
				`INSERT INTO bank_settings (setting_key, setting_value, updated_at) 
				VALUES ($1, $2, CURRENT_TIMESTAMP) 
				ON CONFLICT (setting_key) 
				DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP`,
				[key, value, value]
			);
		} finally {
			client.release();
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