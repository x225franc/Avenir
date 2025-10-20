import { Request, Response } from "express";
import {
	PlaceInvestmentOrder,
	CancelInvestmentOrder,
	GetAvailableStocks,
	GetUserPortfolio,
} from "@application/use-cases";
import { StockRepository } from "@infrastructure/database/mysql/StockRepository";
import { InvestmentOrderRepository } from "@infrastructure/database/mysql/InvestmentOrderRepository";
import { AccountRepository } from "@infrastructure/database/mysql/AccountRepository";
import { MySQLTransactionRepository } from "@infrastructure/database/mysql/TransactionRepository";
import { BankSettingsRepository } from "@infrastructure/database/mysql/BankSettingsRepository";
import { UserId } from "@domain/value-objects/UserId";

/**
 * Controller pour les fonctionnalités d'investissement
 */
export class InvestmentController {
	private placeInvestmentOrderUseCase: PlaceInvestmentOrder;
	private cancelInvestmentOrderUseCase: CancelInvestmentOrder;
	private getAvailableStocksUseCase: GetAvailableStocks;
	private getUserPortfolioUseCase: GetUserPortfolio;

	constructor() {
		const stockRepository = new StockRepository();
		const investmentOrderRepository = new InvestmentOrderRepository();
		const accountRepository = new AccountRepository();
		const transactionRepository = new MySQLTransactionRepository();
		const bankSettingsRepository = new BankSettingsRepository();

		this.placeInvestmentOrderUseCase = new PlaceInvestmentOrder(
			accountRepository,
			stockRepository,
			investmentOrderRepository,
			transactionRepository,
			bankSettingsRepository
		);

		this.cancelInvestmentOrderUseCase = new CancelInvestmentOrder(
			investmentOrderRepository,
			accountRepository
		);

		this.getAvailableStocksUseCase = new GetAvailableStocks(
			stockRepository,
			bankSettingsRepository
		);

		this.getUserPortfolioUseCase = new GetUserPortfolio(
			investmentOrderRepository,
			stockRepository
		);
	}

	/**
	 * GET /api/investment/stocks
	 * Récupère toutes les actions disponibles
	 */
	public async getAvailableStocks(req: Request, res: Response): Promise<void> {
		try {
			const includeUnavailable = req.query.includeUnavailable === "true";
			const result = await this.getAvailableStocksUseCase.execute(
				includeUnavailable
			);

			if (result.success) {
				res.status(200).json({
					success: true,
					data: result.stocks,
					message: result.message,
				});
			} else {
				res.status(400).json({
					success: false,
					errors: result.errors,
					message: result.message,
				});
			}
		} catch (error) {
			console.error("[InvestmentController.getAvailableStocks]", error);
			res.status(500).json({
				success: false,
				message: "Erreur interne du serveur",
				errors: ["Une erreur inattendue s'est produite"],
			});
		}
	}

	/**
	 * POST /api/investment/orders
	 * Place un nouvel ordre d'investissement
	 */
	public async placeOrder(req: Request, res: Response): Promise<void> {
		try {
			// Récupérer l'ID utilisateur depuis le token JWT (middleware auth)
			const userId = (req as any).user?.userId;
			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Non authentifié",
					errors: ["Token d'authentification requis"],
				});
				return;
			}

			const { accountId, stockId, orderType, quantity } = req.body;

			// Validation basique
			if (!accountId || !stockId || !orderType || !quantity) {
				res.status(400).json({
					success: false,
					message: "Données manquantes",
					errors: ["accountId, stockId, orderType et quantity sont requis"],
				});
				return;
			}

			const result = await this.placeInvestmentOrderUseCase.execute({
				userId: userId.toString(),
				accountId: accountId.toString(),
				stockId: stockId.toString(),
				orderType,
				quantity: parseInt(quantity),
			});

			if (result.success) {
				res.status(201).json({
					success: true,
					data: { orderId: result.orderId },
					message: result.message,
				});
			} else {
				res.status(400).json({
					success: false,
					errors: result.errors,
					message: result.message,
				});
			}
		} catch (error) {
			console.error("[InvestmentController.placeOrder]", error);
			res.status(500).json({
				success: false,
				message: "Erreur interne du serveur",
				errors: ["Une erreur inattendue s'est produite"],
			});
		}
	}

	/**
	 * DELETE /api/investment/orders/:orderId
	 * Annule un ordre d'investissement
	 */
	public async cancelOrder(req: Request, res: Response): Promise<void> {
		try {
			// Récupérer l'ID utilisateur depuis le token JWT
			const userId = (req as any).user?.userId;
			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Non authentifié",
					errors: ["Token d'authentification requis"],
				});
				return;
			}

			const { orderId } = req.params;

			if (!orderId) {
				res.status(400).json({
					success: false,
					message: "ID d'ordre manquant",
					errors: ["orderId est requis"],
				});
				return;
			}

			const result = await this.cancelInvestmentOrderUseCase.execute({
				userId: userId.toString(),
				orderId,
			});

			if (result.success) {
				res.status(200).json({
					success: true,
					message: result.message,
				});
			} else {
				res.status(400).json({
					success: false,
					errors: result.errors,
					message: result.message,
				});
			}
		} catch (error) {
			console.error("[InvestmentController.cancelOrder]", error);
			res.status(500).json({
				success: false,
				message: "Erreur interne du serveur",
				errors: ["Une erreur inattendue s'est produite"],
			});
		}
	}

	/**
	 * GET /api/investment/portfolio
	 * Récupère le portefeuille de l'utilisateur connecté
	 */
	public async getPortfolio(req: Request, res: Response): Promise<void> {
		try {
			// Récupérer l'ID utilisateur depuis le token JWT
			const userId = (req as any).user?.userId;
			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Non authentifié",
					errors: ["Token d'authentification requis"],
				});
				return;
			}

			const result = await this.getUserPortfolioUseCase.execute({
				userId: userId.toString(),
			});

			if (result.success) {
				res.status(200).json({
					success: true,
					data: result.portfolio,
					message: result.message,
				});
			} else {
				res.status(400).json({
					success: false,
					errors: result.errors,
					message: result.message,
				});
			}
		} catch (error) {
			console.error("[InvestmentController.getPortfolio]", error);
			res.status(500).json({
				success: false,
				message: "Erreur interne du serveur",
				errors: ["Une erreur inattendue s'est produite"],
			});
		}
	}

	/**
	 * GET /api/investment/orders
	 * Récupère l'historique des ordres de l'utilisateur connecté
	 */
	public async getOrderHistory(req: Request, res: Response): Promise<void> {
		try {
			// Récupérer l'ID utilisateur depuis le token JWT
			const userId = (req as any).user?.userId;
			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Non authentifié",
					errors: ["Token d'authentification requis"],
				});
				return;
			}

			const investmentOrderRepository = new InvestmentOrderRepository();
			const orders = await investmentOrderRepository.findByUserId(
				new UserId(userId.toString())
			);

			res.status(200).json({
				success: true,
				data: orders.map((order) => order.toJSON()),
				message: `${orders.length} ordre(s) trouvé(s)`,
			});
		} catch (error) {
			console.error("[InvestmentController.getOrderHistory]", error);
			res.status(500).json({
				success: false,
				message: "Erreur interne du serveur",
				errors: ["Une erreur inattendue s'est produite"],
			});
		}
	}

	/**
	 * GET /api/investment/fee
	 * Récupère les frais d'investissement actuels
	 */
	async getInvestmentFee(req: Request, res: Response): Promise<void> {
		try {
			const bankSettingsRepository = new BankSettingsRepository();
			const fee = await bankSettingsRepository.getInvestmentFee();

			res.status(200).json({
				success: true,
				data: { fee },
				message: "Frais d'investissement récupérés avec succès",
			});
		} catch (error) {
			console.error("[InvestmentController.getInvestmentFee]", error);
			res.status(500).json({
				success: false,
				message: "Erreur interne du serveur",
				errors: ["Une erreur inattendue s'est produite"],
			});
		}
	}
}
