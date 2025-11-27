import { Router } from "express";
import { SSEController } from "../controllers";

const router = Router();
const sseController = new SSEController();

/**
 * GET /api/sse/stream
 * Établir une connexion SSE
 */
router.get("/stream", (req, res) => sseController.connect(req, res));

/**
 * POST /api/sse/broadcast
 * Diffuser un événement (pour tests/admin)
 */
router.post("/broadcast", (req, res) => sseController.broadcast(req, res));

export default router;
