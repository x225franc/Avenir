import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const adminController = new AdminController();

/**
 * POST /api/admin/apply-interest
 * Exécute manuellement l'application des intérêts (directors uniquement)
 */
router.post("/apply-interest", authMiddleware, (req, res) =>
  adminController.applyInterestManually(req, res)
);

/**
 * POST /api/admin/test-interest
 * Test de l'application des intérêts (dev uniquement, sans auth)
 */
router.post("/test-interest", (req, res) =>
  adminController.testInterest(req, res)
);

/**
 * POST /api/admin/set-savings-rate
 * Définit le taux d'épargne global (dev uniquement)
 */
router.post("/set-savings-rate", (req, res) =>
  adminController.setSavingsRate(req, res)
);

/**
 * GET /api/admin/savings-rate
 * Récupère le taux d'épargne actuel
 */
router.get("/savings-rate", (req, res) =>
  adminController.getSavingsRate(req, res)
);

/**
 * GET /api/admin/cron-status
 * Récupère le statut des tâches planifiées (directors uniquement)
 */
router.get("/cron-status", authMiddleware, (req, res) =>
  adminController.getCronStatus(req, res)
);

export default router;
