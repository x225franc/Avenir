import { Request, Response } from "express";
import { StockRepository } from "../../../../Infrastructure/database/mysql/StockRepository";
import { InvestmentOrderRepository } from "../../../../Infrastructure/database/mysql/InvestmentOrderRepository";
import { CreateStock } from "../../../../Application/use-cases/admin/CreateStock";
import { UpdateStock } from "../../../../Application/use-cases/admin/UpdateStock";
import { DeleteStock } from "../../../../Application/use-cases/admin/DeleteStock";
import { GetAllStocks } from "../../../../Application/use-cases/admin/GetAllStocks";

/**
 * Controller pour la gestion des actions (Stocks) par l'admin
 */
export class AdminStockController {
	private stockRepository = new StockRepository();
	private investmentOrderRepository = new InvestmentOrderRepository();

	/**
	 * GET /api/admin/stocks
	 * Récupère toutes les actions (disponibles et non disponibles)
	 */
	async getAllStocks(req: Request, res: Response): Promise<void> {
		try {
			const availableOnly = req.query.availableOnly === "true";

			const getAllStocks = new GetAllStocks(
				this.stockRepository,
				this.investmentOrderRepository
			);
			const result = await getAllStocks.execute(availableOnly);

			if (result.success) {
				res.status(200).json({
					success: true,
					data: result.data,
				});
			} else {
				res.status(400).json({
					success: false,
					message: result.message,
				});
			}
		} catch (error) {
			console.error("Error in getAllStocks:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de la récupération des actions",
			});
		}
	}

	/**
	 * POST /api/admin/stocks
	 * Crée une nouvelle action
	 */
	async createStock(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;

			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					message:
						"Accès refusé. Seuls les directeurs peuvent créer des actions.",
				});
				return;
			}

			const { symbol, companyName, currentPrice, isAvailable } = req.body;

			// Validation basique
			if (!symbol || !companyName || !currentPrice) {
				res.status(400).json({
					success: false,
					message: "Symbole, nom de l'entreprise et prix sont requis",
				});
				return;
			}

			const createStock = new CreateStock(this.stockRepository);
			const result = await createStock.execute({
				symbol,
				companyName,
				currentPrice: parseFloat(currentPrice),
				isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
			});

			if (result.success) {
				res.status(201).json({
					success: true,
					message: result.message,
					data: {
						stockId: result.stockId,
					},
				});
			} else {
				res.status(400).json({
					success: false,
					message: result.message,
				});
			}
		} catch (error) {
			console.error("Error in createStock:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de la création de l'action",
			});
		}
	}

	/**
	 * PUT /api/admin/stocks/:id
	 * Met à jour une action (symbole, nom, disponibilité uniquement)
	 * Le prix ne peut PAS être modifié directement
	 */
	async updateStock(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;

			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					message:
						"Accès refusé. Seuls les directeurs peuvent modifier des actions.",
				});
				return;
			}

			const { id } = req.params;
			const { symbol, companyName, isAvailable } = req.body;

			// Vérifier que le prix n'est pas dans la requête
			if (req.body.currentPrice !== undefined) {
				res.status(400).json({
					success: false,
					message:
						"Le prix ne peut pas être modifié manuellement. Il est calculé automatiquement selon l'offre et la demande.",
				});
				return;
			}

			const updateStock = new UpdateStock(this.stockRepository);
			const result = await updateStock.execute({
				id,
				symbol,
				companyName,
				isAvailable:
					isAvailable !== undefined ? Boolean(isAvailable) : undefined,
			});

			if (result.success) {
				res.status(200).json({
					success: true,
					message: result.message,
				});
			} else {
				res.status(400).json({
					success: false,
					message: result.message,
				});
			}
		} catch (error) {
			console.error("Error in updateStock:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de la mise à jour de l'action",
			});
		}
	}

	/**
	 * DELETE /api/admin/stocks/:id
	 * Supprime une action
	 */
	async deleteStock(req: Request, res: Response): Promise<void> {
		try {
			// Vérifier que l'utilisateur est un directeur
			const userRole = (req as any).user?.role;

			if (userRole !== "director") {
				res.status(403).json({
					success: false,
					message:
						"Accès refusé. Seuls les directeurs peuvent supprimer des actions.",
				});
				return;
			}

			const { id } = req.params;

			const deleteStock = new DeleteStock(
				this.stockRepository,
				this.investmentOrderRepository
			);
			const result = await deleteStock.execute(id);

			if (result.success) {
				res.status(200).json({
					success: true,
					message: result.message,
				});
			} else {
				res.status(400).json({
					success: false,
					message: result.message,
					holdingsCount: result.holdingsCount,
				});
			}
		} catch (error) {
			console.error("Error in deleteStock:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de la suppression de l'action",
			});
		}
	}
}
