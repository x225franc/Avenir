import { Router } from "express";
import { TransactionController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const transactionController = new TransactionController();

// Toutes les routes de transactions nécessitent une authentification
router.use(authMiddleware);

/**
 * POST /api/transactions/transfer
 * Effectuer un transfert d'argent
 */
router.post("/transfer", (req, res) =>
	transactionController.transfer(req, res)
);

/**
 * GET /api/transactions/account/:accountId
 * Récupérer l'historique des transactions d'un compte
 */
router.get("/account/:accountId", (req, res) =>
	transactionController.getAccountTransactions(req, res)
);

export default router;
