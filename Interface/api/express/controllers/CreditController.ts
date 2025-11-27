import { Request, Response } from "express";
import { GrantCredit } from "../../../../Application/use-cases/credit/GrantCredit";
import { GetUserCredits } from "../../../../Application/use-cases/credit/GetUserCredits";
import { CreditRepository } from "../../../../Infrastructure/database/mysql/CreditRepository";
import { AccountRepository } from "../../../../Infrastructure/database/mysql/AccountRepository";
import { UserRepository } from "../../../../Infrastructure/database/mysql/UserRepository";
import { CreditCalculationService } from "../../../../Application/services/CreditCalculationService";

/**
 * Controller : CreditController
 * Gère les routes liées aux crédits
 */
export class CreditController {
	private creditRepository = new CreditRepository();
	private accountRepository = new AccountRepository();
	private userRepository = new UserRepository();
	private calculationService = new CreditCalculationService();

	/**
	 * POST /api/credits/grant
	 * Octroyer un crédit à un client (conseiller/directeur uniquement)
	 */
	grantCredit = async (req: Request, res: Response) => {
		try {
			const advisorId = (req as any).user?.userId;

			if (!advisorId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const {
				userId,
				accountId,
				principalAmount,
				annualInterestRate,
				insuranceRate,
				durationMonths,
			} = req.body;

			// Validation
			if (
				!userId ||
				!accountId ||
				!principalAmount ||
				annualInterestRate === undefined ||
				insuranceRate === undefined ||
				!durationMonths
			) {
				return res.status(400).json({
					success: false,
					message: "Missing required fields",
				});
			}

			if (principalAmount <= 0) {
				return res.status(400).json({
					success: false,
					message: "Principal amount must be positive",
				});
			}

			if (annualInterestRate < 0 || annualInterestRate > 1) {
				return res.status(400).json({
					success: false,
					message: "Annual interest rate must be between 0 and 1",
				});
			}

			if (insuranceRate < 0 || insuranceRate > 1) {
				return res.status(400).json({
					success: false,
					message: "Insurance rate must be between 0 and 1",
				});
			}

			if (durationMonths <= 0 || durationMonths > 360) {
				return res.status(400).json({
					success: false,
					message: "Duration must be between 1 and 360 months",
				});
			}

			const useCase = new GrantCredit(
				this.creditRepository,
				this.accountRepository,
				this.userRepository,
				this.calculationService
			);

			const result = await useCase.execute({
				userId,
				accountId,
				advisorId,
				principalAmount,
				annualInterestRate,
				insuranceRate,
				durationMonths,
			});

			return res.status(201).json(result);
		} catch (error) {
			console.error("Error granting credit:", error);
			return res.status(500).json({
				success: false,
				message:
					error instanceof Error ? error.message : "Internal server error",
			});
		}
	};

	/**
	 * GET /api/credits/user/:userId
	 * Récupérer les crédits d'un utilisateur
	 */
	getUserCredits = async (req: Request, res: Response) => {
		try {
			const { userId } = req.params;
			const requestingUserId = (req as any).user?.userId;
			const requestingUserRole = (req as any).user?.role;

			if (!requestingUserId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			// Vérifier que l'utilisateur demande ses propres crédits
			// ou qu'il est conseiller/directeur
			if (
				parseInt(userId) !== parseInt(requestingUserId) &&
				requestingUserRole !== "advisor" &&
				requestingUserRole !== "director"
			) {
				return res.status(403).json({
					success: false,
					message: "Forbidden",
				});
			}

			const useCase = new GetUserCredits(this.creditRepository);
			const result = await useCase.execute({ userId: parseInt(userId) });

			return res.status(200).json(result);
		} catch (error) {
			console.error("Error getting user credits:", error);
			return res.status(500).json({
				success: false,
				message:
					error instanceof Error ? error.message : "Internal server error",
			});
		}
	};

	/**
	 * GET /api/credits/calculate
	 * Calculer les mensualités d'un crédit (simulation)
	 */
	calculateCredit = async (req: Request, res: Response) => {
		try {
			const {
				principalAmount,
				annualInterestRate,
				insuranceRate,
				durationMonths,
			} = req.query;

			if (
				!principalAmount ||
				annualInterestRate === undefined ||
				insuranceRate === undefined ||
				!durationMonths
			) {
				return res.status(400).json({
					success: false,
					message: "Missing required parameters",
				});
			}

			const totalCost = this.calculationService.calculateTotalCost(
				parseFloat(principalAmount as string),
				parseFloat(annualInterestRate as string),
				parseFloat(insuranceRate as string),
				parseInt(durationMonths as string)
			);

			return res.status(200).json({
				success: true,
				...totalCost,
			});
		} catch (error) {
			console.error("Error calculating credit:", error);
			return res.status(500).json({
				success: false,
				message:
					error instanceof Error ? error.message : "Internal server error",
			});
		}
	};
}
