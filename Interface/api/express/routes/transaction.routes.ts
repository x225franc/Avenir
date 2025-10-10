import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const transactionController = new TransactionController();

// Toutes les routes de transactions nécessitent une authentification
router.use(authMiddleware);

/**
 * @route   POST /api/transactions/transfer
 * @desc    Effectuer un transfert d'argent
 * @access  Private
 */
router.post("/transfer", (req, res) =>
	transactionController.transfer(req, res)
);

/**
 * @route   GET /api/transactions/account/:accountId
 * @desc    Récupérer l'historique des transactions d'un compte
 * @access  Private
 */
router.get("/account/:accountId", (req, res) =>
	transactionController.getAccountTransactions(req, res)
);

export default router;
