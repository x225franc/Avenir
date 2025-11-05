import { Router } from "express";
import { NewsController } from "../controllers/NewsController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const newsController = new NewsController();

/**
 * @route GET /api/news
 * @desc Récupérer toutes les actualités (publiées seulement pour le public)
 * @access Public
 */
router.get("/", (req, res) => newsController.getAll(req, res));

/**
 * @route GET /api/news/:id
 * @desc Récupérer une actualité par ID
 * @access Public
 */
router.get("/:id", (req, res) => newsController.getById(req, res));

/**
 * @route POST /api/news
 * @desc Créer une nouvelle actualité
 * @access Private (Advisor/Director only)
 */
router.post("/", authMiddleware, (req, res) =>
	newsController.create(req, res)
);

/**
 * @route PUT /api/news/:id
 * @desc Mettre à jour une actualité
 * @access Private (Advisor/Director only)
 */
router.put("/:id", authMiddleware, (req, res) =>
	newsController.update(req, res)
);

/**
 * @route DELETE /api/news/:id
 * @desc Supprimer une actualité
 * @access Private (Advisor/Director only)
 */
router.delete("/:id", authMiddleware, (req, res) =>
	newsController.delete(req, res)
);

export default router;
