import { Router } from "express";
import { UserController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

/**
 * POST /api/users/register
 * Inscription d'un nouvel utilisateur
 */
router.post("/register", (req, res) => userController.register(req, res));

/**
 * POST /api/users/login
 * Connexion d'un utilisateur
 */
router.post("/login", (req, res) => userController.login(req, res));

/**
 * GET /api/users/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get("/me", authMiddleware, (req, res) => userController.getMe(req, res));

/**
 * GET /api/users/:id
 * Récupérer les informations d'un utilisateur par son ID
 */
router.get("/:id", (req, res) => userController.getUserById(req, res));

/**
 * GET /api/users/verify-email?token=XXX
 * Vérifier l'email d'un utilisateur
 */
router.get("/verify-email", (req, res) => userController.verifyEmail(req, res));

/**
 * POST /api/users/forgot-password
 * Demander un lien de réinitialisation de mot de passe
 */
router.post("/forgot-password", (req, res) =>
	userController.forgotPassword(req, res)
);

/**
 * POST /api/users/reset-password
 * Réinitialiser le mot de passe avec un token
 */
router.post("/reset-password", (req, res) =>
	userController.resetPassword(req, res)
);

export default router;
