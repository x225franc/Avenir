import { Router } from "express";
import { MessageController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const messageController = new MessageController();

/**
 * POST /api/messages/send
 * Envoyer un message
 */
router.post("/send", authMiddleware, (req, res) =>
	messageController.sendMessage(req, res)
);

/**
 * GET /api/messages/conversations
 * Récupérer toutes les conversations
 */
router.get("/conversations", authMiddleware, (req, res) =>
	messageController.getConversations(req, res)
);

/**
 * GET /api/messages/conversation/:conversationId
 * Récupérer une conversation spécifique
 */
router.get("/conversation/:conversationId", authMiddleware, (req, res) =>
	messageController.getConversation(req, res)
);

/**
 * POST /api/messages/assign
 * Assigner une conversation à un conseiller
 */
router.post("/assign", authMiddleware, (req, res) =>
	messageController.assignConversation(req, res)
);

/**
 * POST /api/messages/transfer
 * Transférer une conversation à un autre conseiller
 */
router.post("/transfer", authMiddleware, (req, res) =>
	messageController.transferConversation(req, res)
);

/**
 * POST /api/messages/close
 * Fermer une conversation
 */
router.post("/close", authMiddleware, (req, res) =>
	messageController.closeConversation(req, res)
);

/**
 * POST /api/messages/mark-read
 * Marquer les messages comme lus
 */
router.post("/mark-read", authMiddleware, (req, res) =>
	messageController.markAsRead(req, res)
);

/**
 * GET /api/messages/check-open/:clientId
 * Vérifier si un client a une conversation ouverte
 */
router.get("/check-open/:clientId", authMiddleware, (req, res) =>
	messageController.checkOpenConversation(req, res)
);

export default router;
