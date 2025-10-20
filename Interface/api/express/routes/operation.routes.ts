import { Router } from "express";
import { OperationController } from "../controllers/OperationController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const operationController = new OperationController();

/**
 * POST /api/operations/deposit
 * Déposer de l'argent sur un compte
 */
router.post("/deposit", authMiddleware, (req, res) =>
  operationController.deposit(req, res)
);

/**
 * POST /api/operations/withdraw
 * Retirer de l'argent d'un compte
 */
router.post("/withdraw", authMiddleware, (req, res) =>
  operationController.withdraw(req, res)
);

export default router;
