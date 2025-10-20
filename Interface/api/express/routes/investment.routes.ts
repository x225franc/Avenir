import { Router } from "express";
import { InvestmentController } from "../controllers/InvestmentController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const investmentController = new InvestmentController();

/**
 * GET /api/investment/stocks
 * Récupère toutes les actions disponibles (public)
 */
router.get("/stocks", (req, res) =>
	investmentController.getAvailableStocks(req, res)
);

/**
 * POST /api/investment/orders
 * Place un nouvel ordre d'investissement (authentifié)
 */
router.post("/orders", authMiddleware, (req, res) =>
	investmentController.placeOrder(req, res)
);

/**
 * DELETE /api/investment/orders/:orderId
 * Annule un ordre d'investissement (authentifié)
 */
router.delete("/orders/:orderId", authMiddleware, (req, res) =>
	investmentController.cancelOrder(req, res)
);

/**
 * GET /api/investment/orders
 * Récupère l'historique des ordres (authentifié)
 */
router.get("/orders", authMiddleware, (req, res) =>
	investmentController.getOrderHistory(req, res)
);

/**
 * GET /api/investment/portfolio
 * Récupère le portefeuille de l'utilisateur (authentifié)
 */
router.get("/portfolio", authMiddleware, (req, res) =>
	investmentController.getPortfolio(req, res)
);

/**
 * GET /api/investment/fee
 * Récupère les frais d'investissement actuels (public)
 */
router.get("/fee", (req, res) =>
	investmentController.getInvestmentFee(req, res)
);

export default router;
