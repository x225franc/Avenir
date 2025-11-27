import { Router } from "express";
import { CreditController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const creditController = new CreditController();

/**
 * POST /api/credits/grant
 * Octroyer un crédit (conseiller/directeur uniquement)
 */
router.post("/grant", authMiddleware, (req, res) =>
	creditController.grantCredit(req, res)
);

/**
 * GET /api/credits/user/:userId
 * Récupérer les crédits d'un utilisateur
 */
router.get("/user/:userId", authMiddleware, (req, res) =>
	creditController.getUserCredits(req, res)
);

/**
 * GET /api/credits/calculate
 * Simuler un crédit (calcul des mensualités)
 */
router.get("/calculate", authMiddleware, (req, res) =>
	creditController.calculateCredit(req, res)
);

export default router;
