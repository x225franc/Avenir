import { Router } from "express";
import { AccountController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const accountController = new AccountController();

// Toutes les routes de comptes nécessitent une authentification
router.use(authMiddleware);

/**
 * POST /api/accounts
 * Créer un nouveau compte bancaire
 */
router.post("/", (req, res) => accountController.create(req, res));

/**
 * GET /api/accounts
 * Récupérer tous les comptes de l'utilisateur
 */
router.get("/", (req, res) => accountController.getAll(req, res));

/**
 * GET /api/accounts/:id
 * Récupérer un compte spécifique
 */
router.get("/:id", (req, res) => accountController.getById(req, res));

/**
 * PUT /api/accounts/:id
 * Mettre à jour un compte
 */
router.put("/:id", (req, res) => accountController.update(req, res));

/**
 * DELETE /api/accounts/:id
 * Supprimer un compte
 */
router.delete("/:id", (req, res) => accountController.delete(req, res));

/**
 * GET /api/accounts/user/:userId
 * Récupérer tous les comptes d'un utilisateur (conseiller/directeur uniquement)
 */
router.get("/user/:userId", (req, res) => accountController.getUserAccounts(req, res));

export default router;
