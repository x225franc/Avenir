import { Router } from "express";
import { AccountController } from "../controllers/AccountController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const accountController = new AccountController();

// Toutes les routes de comptes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route   POST /api/accounts
 * @desc    Créer un nouveau compte bancaire
 * @access  Private
 */
router.post("/", (req, res) => accountController.create(req, res));

/**
 * @route   GET /api/accounts
 * @desc    Récupérer tous les comptes de l'utilisateur
 * @access  Private
 */
router.get("/", (req, res) => accountController.getAll(req, res));

/**
 * @route   GET /api/accounts/:id
 * @desc    Récupérer un compte spécifique
 * @access  Private
 */
router.get("/:id", (req, res) => accountController.getById(req, res));

/**
 * @route   PUT /api/accounts/:id
 * @desc    Mettre à jour un compte
 * @access  Private
 */
router.put("/:id", (req, res) => accountController.update(req, res));

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Supprimer un compte
 * @access  Private
 */
router.delete("/:id", (req, res) => accountController.delete(req, res));

export default router;
