import { Request, Response } from "express";
import { getCronService } from "../../../../Infrastructure/jobs/CronService";
import { BankSettingsRepository } from "../../../../Infrastructure/database/mysql/BankSettingsRepository";
import { AccountRepository } from "../../../../Infrastructure/database/mysql/AccountRepository";
import { UserRepository } from "../../../../Infrastructure/database/mysql/UserRepository";
import { UpdateSavingsRate } from "../../../../Application/use-cases/admin/UpdateSavingsRate";
import { GetSavingsRate } from "../../../../Application/use-cases/admin/GetSavingsRate";
import { emailService } from "../../../../Infrastructure/services/email.service";
import { getSSEService } from "../../../../Infrastructure/services/SSEService";

/**
 * Controller pour les tâches administratives (cron jobs, maintenance, etc.)
 */
export class AdminController {
	private bankSettingsRepository = new BankSettingsRepository();
	private accountRepository = new AccountRepository();
	private userRepository = new UserRepository();
	/**
	 * POST /api/admin/apply-interest
	 * Exécute manuellement l'application des intérêts (pour testing)
	 */
	async applyInterestManually(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est authentifié et est un director
			const userId = (req as any).user?.userId;
			const userRole = (req as any).user?.role;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Non autorisé",
				});
				return;
			}

			// Seuls les directors peuvent exécuter cette action
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					message:
						"Accès refusé. Seuls les directeurs peuvent exécuter cette action.",
				});
				return;
			}

			console.log(
				`[AdminController] Manual interest application triggered by user ${userId}`
			);

			const cronService = getCronService();
			await cronService.runDailyInterestNow();

			res.status(200).json({
				success: true,
				message: "Application des intérêts exécutée avec succès",
			});
		} catch (error) {
			console.error("Error in applyInterestManually:", error);
			res.status(500).json({
				success: false,
				message: "Une erreur est survenue lors de l'application des intérêts",
			});
		}
	}

	/**
	 * POST /api/admin/test-interest
	 * Test simple pour vérifier l'application des intérêts
	 */
	async testInterest(req: Request, res: Response): Promise<void> {
		try {
			console.log("[AdminController] Test interest application triggered");

			const cronService = getCronService();
			const result = await cronService.runDailyInterestNow();

			res.status(200).json({
				success: true,
				message: "Test des intérêts quotidiens exécuté avec succès",
				data: result,
			});
		} catch (error) {
			console.error("Error in testInterest:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors du test des intérêts",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/**
	 * PUT /api/admin/savings-rate
	 * Définit le taux d'épargne global et notifie les clients
	 */
	async updateSavingsRate(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est authentifié et est un director
			const userId = (req as any).user?.userId;
			const userRole = (req as any).user?.role;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Non autorisé",
				});
				return;
			}

			// Seuls les directors peuvent modifier le taux
			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					message:
						"Accès refusé. Seuls les directeurs peuvent modifier le taux d'épargne.",
				});
				return;
			}

			const { rate } = req.body;

			if (rate === undefined || rate < 0 || rate > 100) {
				res.status(400).json({
					success: false,
					message: "Le taux doit être entre 0 et 100%",
				});
				return;
			}

			// Utiliser le use case pour mettre à jour et notifier
			const updateSavingsRate = new UpdateSavingsRate(
				this.bankSettingsRepository,
				this.accountRepository,
				this.userRepository,
				emailService
			);

			const result = await updateSavingsRate.execute(rate);

			// Émettre événement SSE pour notifier tous les clients en temps réel
			try {
				const sseService = getSSEService();
				sseService.broadcastToRole(
					"savings_rate:updated",
					{
						oldRate: result.oldRate,
						newRate: result.newRate,
						message: `Le taux d'épargne a été modifié de ${result.oldRate}% à ${result.newRate}%`,
					},
					"client"
				);
			} catch (error) {
				console.error("Erreur lors de l'envoi SSE:", error);
			}

			res.status(200).json({
				success: true,
				message: result.message,
				data: {
					oldRate: result.oldRate,
					newRate: result.newRate,
					notifiedUsers: result.notifiedUsers,
				},
			});
		} catch (error) {
			console.error("Error in updateSavingsRate:", error);
			res.status(500).json({
				success: false,
				message: "❌ Erreur lors de la mise à jour du taux",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/**
	 * GET /api/admin/savings-rate
	 * Récupère le taux d'épargne actuel
	 */
	async getSavingsRate(req: Request, res: Response): Promise<void> {
		try {
			const getSavingsRate = new GetSavingsRate(this.bankSettingsRepository);
			const result = await getSavingsRate.execute();

			res.status(200).json({
				success: true,
				data: {
					rate: result.rate,
					rateFormatted: `${result.rate}%`,
					lastUpdate: result.lastUpdate,
				},
			});
		} catch (error) {
			console.error("Error in getSavingsRate:", error);
			res.status(500).json({
				success: false,
				message: "❌ Erreur lors de la récupération du taux",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/**
	 * GET /api/admin/cron-status
	 * Récupère le statut des tâches planifiées
	 */
	async getCronStatus(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;
			const userRole = (req as any).user?.role;

			if (!userId || userRole !== "director") {
				res.status(403).json({
					success: false,
					message: "Accès refusé",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: {
					status: "running",
					jobs: [
						{
							name: "daily-interest",
							schedule: "59 23 * * *",
							description:
								"Applique les intérêts quotidiens aux comptes d'épargne",
							nextRun: "Tous les jours à 23:59",
						},
					],
				},
			});
		} catch (error) {
			console.error("Error in getCronStatus:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de la récupération du statut",
			});
		}
	}
}
