import { Router } from "express";
import { TransactionController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const transactionController = new TransactionController();

/**
 * POST /api/transfers
 * Effectue un transfert entre deux comptes
 */
router.post("/", authMiddleware, (req, res) =>
  transactionController.transfer(req, res)
);

/**
 * GET /api/transfers/account/:accountId
 * Récupère l'historique des transactions d'un compte
 */
router.get("/account/:accountId", authMiddleware, (req, res) =>
  transactionController.getTransactionsByAccount(req, res)
);

/**
 * GET /api/transfers
 * Récupère toutes les transactions de l'utilisateur connecté
 */
router.get("/", authMiddleware, (req, res) =>
  transactionController.getUserTransactions(req, res)
);

/**
 * GET /api/transfers/iban/lookup/:iban
 * Récupère les informations d'un compte par son IBAN
 */
router.get("/iban/lookup/:iban", authMiddleware, (req, res) =>
  transactionController.getAccountByIban(req, res)
);

/**
 * POST /api/transfers/iban
 * Effectue un transfert vers un IBAN externe
 */
router.post("/iban", authMiddleware, (req, res) =>
  transactionController.transferToIban(req, res)
);

export default router;
