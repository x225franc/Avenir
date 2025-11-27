import { Router } from "express";
import { AdvisorController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const advisorController = new AdvisorController();

/**
 * GET /api/advisor/advisors
 * Récupère tous les conseillers pour le transfert de conversations
 */
router.get("/advisors", (req, res) =>
	advisorController.getAdvisors(req, res)
);

/**
 * GET /api/advisor/clients
 * Récupère tous les clients pour consultation (advisors uniquement)
 */
router.get("/clients", authMiddleware, (req, res) =>
	advisorController.getClients(req, res)
);

/**
 * GET /api/advisor/transactions
 * Récupère toutes les transactions pour consultation (advisors uniquement)
 */
router.get("/transactions", authMiddleware, (req, res) =>
	advisorController.getAllTransactions(req, res)
);

/**
 * GET /api/advisor/transactions/pending
 * Récupère les transactions en attente (advisors uniquement)
 */
router.get("/transactions/pending", authMiddleware, (req, res) =>
	advisorController.getPendingTransactions(req, res)
);

/**
 * PATCH /api/advisor/transactions/:id/approve
 * Approuver une transaction (advisors uniquement)
 */
router.patch("/transactions/:id/approve", authMiddleware, (req, res) =>
	advisorController.approveTransaction(req, res)
);

/**
 * PATCH /api/advisor/transactions/:id/reject
 * Rejeter une transaction (advisors uniquement)
 */
router.patch("/transactions/:id/reject", authMiddleware, (req, res) =>
	advisorController.rejectTransaction(req, res)
);

/**
 * POST /api/advisor/notify-client
 * Envoyer une notification email personnalisée à un client
 */
router.post("/notify-client", (req, res) =>
	advisorController.notifyClient(req, res)
);

export default router;
