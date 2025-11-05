import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { AdminUserController } from "../controllers/AdminUserController";
import { AdminStockController } from "../controllers/AdminStockController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const adminController = new AdminController();
const adminUserController = new AdminUserController();
const adminStockController = new AdminStockController();

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
 * PUT /api/admin/savings-rate
 * Définit le taux d'épargne global et notifie les clients (directors uniquement)
 */
router.put("/savings-rate", authMiddleware, (req, res) =>
  adminController.updateSavingsRate(req, res)
);

/**
 * GET /api/admin/savings-rate
 * Récupère le taux d'épargne actuel
 */
router.get("/savings-rate", authMiddleware, (req, res) =>
  adminController.getSavingsRate(req, res)
);

/**
 * GET /api/admin/cron-status
 * Récupère le statut des tâches planifiées (directors uniquement)
 */
router.get("/cron-status", authMiddleware, (req, res) =>
  adminController.getCronStatus(req, res)
);

// Routes de gestion des utilisateurs (admins uniquement)
/**
 * GET /api/admin/users
 * Récupère tous les utilisateurs (directors uniquement)
 */
router.get("/users", authMiddleware, (req, res) =>
  adminUserController.getAllUsers(req, res)
);

/**
 * GET /api/admin/users/:id
 * Récupère un utilisateur par son ID (directors uniquement)
 */
router.get("/users/:id", authMiddleware, (req, res) =>
  adminUserController.getUserById(req, res)
);

/**
 * POST /api/admin/users
 * Créer un nouvel utilisateur (directors uniquement)
 */
router.post("/users", authMiddleware, (req, res) =>
  adminUserController.createUser(req, res)
);

/**
 * PUT /api/admin/users/:id
 * Mettre à jour un utilisateur (directors uniquement)
 */
router.put("/users/:id", authMiddleware, (req, res) =>
  adminUserController.updateUser(req, res)
);

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur (directors uniquement)
 */
router.delete("/users/:id", authMiddleware, (req, res) =>
  adminUserController.deleteUser(req, res)
);

/**
 * PATCH /api/admin/users/:id/ban
 * Bannir un utilisateur (directors uniquement)
 */
router.patch("/users/:id/ban", authMiddleware, (req, res) =>
  adminUserController.banUser(req, res)
);

/**
 * PATCH /api/admin/users/:id/unban
 * Débannir un utilisateur (directors uniquement)
 */
router.patch("/users/:id/unban", authMiddleware, (req, res) =>
  adminUserController.unbanUser(req, res)
);

// Routes de gestion des actions (stocks) - directors uniquement
/**
 * GET /api/admin/stocks
 * Récupère toutes les actions (directors uniquement)
 */
router.get("/stocks", authMiddleware, (req, res) =>
  adminStockController.getAllStocks(req, res)
);

/**
 * POST /api/admin/stocks
 * Crée une nouvelle action (directors uniquement)
 */
router.post("/stocks", authMiddleware, (req, res) =>
  adminStockController.createStock(req, res)
);

/**
 * PUT /api/admin/stocks/:id
 * Met à jour une action - symbole, nom, disponibilité uniquement (directors uniquement)
 * Note: Le prix ne peut PAS être modifié manuellement
 */
router.put("/stocks/:id", authMiddleware, (req, res) =>
  adminStockController.updateStock(req, res)
);

/**
 * DELETE /api/admin/stocks/:id
 * Supprime une action (directors uniquement)
 */
router.delete("/stocks/:id", authMiddleware, (req, res) =>
  adminStockController.deleteStock(req, res)
);

export default router;
