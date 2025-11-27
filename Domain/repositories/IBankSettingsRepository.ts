/**
 * Interface du repository pour les paramètres de la banque
 */
export interface IBankSettingsRepository {
	/**
	 * Récupère la valeur d'un paramètre
	 */
	getSetting(key: string): Promise<string | null>;

	/**
	 * Définit la valeur d'un paramètre
	 */
	setSetting(key: string, value: string): Promise<void>;

	/**
	 * Récupère le taux d'épargne actuel
	 */
	getSavingsRate(): Promise<number>;

	/**
	 * Définit le taux d'épargne
	 */
	setSavingsRate(rate: number): Promise<void>;

	/**
	 * Récupère les frais d'investissement actuels
	 */
	getInvestmentFee(): Promise<number>;

	/**
	 * Définit les frais d'investissement
	 */
	setInvestmentFee(fee: number): Promise<void>;
}