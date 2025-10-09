import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/users/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post("/register", (req, res) => userController.register(req, res));

/**
 * @route   POST /api/users/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post("/login", (req, res) => userController.login(req, res));

/**
 * @route   GET /api/users/me
 * @desc    Récupérer les informations de l'utilisateur connecté
 * @access  Private
 */
router.get("/me", authMiddleware, (req, res) => userController.getMe(req, res));

/**
 * @route   GET /api/users/verify-email?token=XXX
 * @desc    Vérifier l'email d'un utilisateur
 * @access  Public
 */
router.get("/verify-email", (req, res) => userController.verifyEmail(req, res));

/**
 * @route   POST /api/users/forgot-password
 * @desc    Demander un lien de réinitialisation de mot de passe
 * @access  Public
 */
router.post("/forgot-password", (req, res) =>
	userController.forgotPassword(req, res)
);

/**
 * @route   POST /api/users/reset-password
 * @desc    Réinitialiser le mot de passe avec un token
 * @access  Public
 */
router.post("/reset-password", (req, res) =>
	userController.resetPassword(req, res)
);

export default router;
