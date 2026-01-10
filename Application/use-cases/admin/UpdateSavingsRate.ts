import { IBankSettingsRepository } from "@domain/repositories/IBankSettingsRepository";
import { IAccountRepository } from "@domain/repositories/IAccountRepository";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { EmailService } from "@infrastructure/services/email.service";
import { UserId } from "@domain/value-objects/UserId";

export class UpdateSavingsRate {
	constructor(
		private readonly bankSettingsRepository: IBankSettingsRepository,
		private readonly accountRepository: IAccountRepository,
		private readonly userRepository: IUserRepository,
		private readonly emailService: EmailService
	) {}

	/**
	 * Exécuter la mise à jour du taux d'épargne
	 */
	async execute(newRate: number): Promise<{
		success: boolean;
		message: string;
		oldRate: number;
		newRate: number;
		notifiedUsers: number;
	}> {
		try {
			// Validation du taux
			if (newRate < 0 || newRate > 100) {
				throw new Error("Le taux d'épargne doit être entre 0 et 100%");
			}

			// Récupérer le taux actuel
			const oldRate = await this.bankSettingsRepository.getSavingsRate();

			// Mettre à jour le taux
			await this.bankSettingsRepository.setSavingsRate(newRate);

			// Récupérer tous les comptes d'épargne
			const savingsAccounts =
				await this.accountRepository.findAllSavingsAccounts();

			// Extraire les userId uniques
			const uniqueUserIds = [
				...new Set(savingsAccounts.map((account) => account.userId.value)),
			];

			// Notifier chaque utilisateur ayant un compte d'épargne
			let notifiedCount = 0;
			for (const userId of uniqueUserIds) {
				try {
					const user = await this.userRepository.findById(new UserId(userId));
					if (user && user.email) {
						await this.emailService.sendSavingsRateChangeEmail(
							user.email.value,
							user.firstName,
							oldRate,
							newRate
						);
						notifiedCount++;
					}
				} catch (emailError) {
					console.error(
						`Erreur lors de l'envoi de l'email à l'utilisateur ${userId}:`,
						emailError
					);
					// Continue même si un email échoue
				}
			}

			return {
				success: true,
				message: `Taux d'épargne mis à jour de ${oldRate}% à ${newRate}%. ${notifiedCount} utilisateur(s) notifié(s).`,
				oldRate,
				newRate,
				notifiedUsers: notifiedCount,
			};
		} catch (error: any) {
			throw new Error(
				`Erreur lors de la mise à jour du taux d'épargne: ${error.message}`
			);
		}
	}
}
