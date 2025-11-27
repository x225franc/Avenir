import { Router } from "express";
import { NewsController } from "../controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const newsController = new NewsController();

/**
 * GET /api/news
 * Récupérer toutes les actualités (publiées seulement pour le public)
 */
router.get("/", (req, res) => newsController.getAll(req, res));

/**
 * GET /api/news/:id
 * Récupérer une actualité par ID
 */
router.get("/:id", (req, res) => newsController.getById(req, res));

/**
 * POST /api/news
 * Créer une nouvelle actualité
 */
router.post("/", authMiddleware, (req, res) =>
	newsController.create(req, res)
);

/**
 * PUT /api/news/:id
 * Mettre à jour une actualité
 */
router.put("/:id", authMiddleware, (req, res) =>
	newsController.update(req, res)
);

/**
 * DELETE /api/news/:id
 * Supprimer une actualité
 */
router.delete("/:id", authMiddleware, (req, res) =>
	newsController.delete(req, res)
);

export default router;
