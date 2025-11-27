import { Router } from "express";
import { InternalMessageController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const internalMessageController = new InternalMessageController();

/**
 * POST /api/internal-messages
 * Envoyer un message interne
 */
router.post("/", authMiddleware, (req, res) =>
	internalMessageController.sendMessage(req, res)
);

/**
 * GET /api/internal-messages
 * Récupérer les messages internes
 */
router.get("/", authMiddleware, (req, res) =>
	internalMessageController.getMessages(req, res)
);

/**
 * GET /api/internal-messages/staff-members
 * Récupérer tous les conseillers et directeurs
 */
router.get("/staff-members", authMiddleware, (req, res) =>
	internalMessageController.getStaffMembers(req, res)
);

export default router;
