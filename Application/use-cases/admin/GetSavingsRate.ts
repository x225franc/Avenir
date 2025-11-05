import { IBankSettingsRepository } from "@domain/repositories/IBankSettingsRepository";

/**
 * Use Case: Récupérer le taux d'épargne actuel
 */
export class GetSavingsRate {
	constructor(
		private readonly bankSettingsRepository: IBankSettingsRepository
	) {}

	/**
	 * Exécuter la récupération du taux d'épargne
	 */
	async execute(): Promise<{
		rate: number;
		lastUpdate: Date;
	}> {
		try {
			const rate = await this.bankSettingsRepository.getSavingsRate();

			return {
				rate,
				lastUpdate: new Date(), // Pourrait être récupéré de la DB si nécessaire
			};
		} catch (error: any) {
			throw new Error(
				`Erreur lors de la récupération du taux d'épargne: ${error.message}`
			);
		}
	}
}
