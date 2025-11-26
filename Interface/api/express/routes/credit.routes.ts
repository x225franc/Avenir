import { Router } from "express";
import { CreditController } from "../controllers/CreditController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const creditController = new CreditController();

/**
 * @route POST /api/credits/grant
 * @desc Octroyer un crédit (conseiller/directeur uniquement)
 * @access Private (advisor, director)
 */
router.post("/grant", authMiddleware, creditController.grantCredit);

/**
 * @route GET /api/credits/user/:userId
 * @desc Récupérer les crédits d'un utilisateur
 * @access Private (client + advisor/director)
 */
router.get("/user/:userId", authMiddleware, creditController.getUserCredits);

/**
 * @route GET /api/credits/calculate
 * @desc Simuler un crédit (calcul des mensualités)
 * @access Private
 */
router.get("/calculate", authMiddleware, creditController.calculateCredit);

export default router;
