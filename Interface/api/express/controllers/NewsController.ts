import { Request, Response } from "express";
import {
	CreateNews,
	GetNews,
	UpdateNews,
	DeleteNews,
	CreateNewsDTO,
	UpdateNewsDTO,
} from "@application/use-cases";
import { NewsRepository } from "@infrastructure/database/mysql/NewsRepository";
import { UserRepository } from "@infrastructure/database/mysql/UserRepository";
import { UserId } from "@domain/value-objects/UserId";
import { getSSEService } from "../../../../Infrastructure/services/SSEService";

/**
 * Controller pour les actualités
 */
export class NewsController {
	private createNewsUseCase: CreateNews;
	private getNewsUseCase: GetNews;
	private updateNewsUseCase: UpdateNews;
	private deleteNewsUseCase: DeleteNews;

	constructor() {
		const newsRepository = new NewsRepository();
		this.createNewsUseCase = new CreateNews(newsRepository);
		this.getNewsUseCase = new GetNews(newsRepository);
		this.updateNewsUseCase = new UpdateNews(newsRepository);
		this.deleteNewsUseCase = new DeleteNews(newsRepository);
	}

	/**
	 * POST /api/news
	 * Créer une nouvelle actualité (advisor/director seulement)
	 */
	async create(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.userId;
			const userRole = (req as any).user?.role;

			// Vérifier que l'utilisateur est advisor ou director
			if (!userRole || !["advisor", "director"].includes(userRole)) {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers et directeurs peuvent créer des actualités.",
				});
				return;
			}

			const dto: CreateNewsDTO = {
				...req.body,
				authorId: userId,
			};

			// Validation
			if (!dto.title || !dto.content) {
				res.status(400).json({
					success: false,
					error: "Titre et contenu sont requis",
				});
				return;
			}

			const result = await this.createNewsUseCase.execute(dto);

			if (result.success) {
				// Émettre événement SSE pour notifier les clients
				try {
					const sseService = getSSEService();
					sseService.broadcastToRole(
						"news:created",
						{
							id: result.news?.id,
							title: result.news?.title,
							content: result.news?.content,
							authorId: result.news?.authorId,
							published: result.news?.published,
							createdAt: result.news?.createdAt,
						},
						"client"
					);
				} catch (error) {
					console.error("Erreur lors de l'envoi SSE:", error);
				}

				res.status(201).json({
					success: true,
					message: "Actualité créée avec succès",
					data: result.news,
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in create news:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la création de l'actualité",
			});
		}
	}

	/**
	 * GET /api/news
	 * Récupérer toutes les actualités
	 * Query param: published=true pour ne récupérer que les publiées
	 */
	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const publishedOnly = req.query.published === "true";
			const result = await this.getNewsUseCase.execute(publishedOnly);

			if (result.success) {
				// Enrichir avec les informations de l'auteur (nom + rôle)
				const userRepository = new UserRepository();
				const uniqueAuthorIds = Array.from(
					new Set((result.news || []).map((n) => n.authorId.value))
				);
				const authorMap = new Map<string, { fullName: string; role: string }>();
				for (const id of uniqueAuthorIds) {
					try {
						const user = await userRepository.findById(UserId.fromString(id));
						if (user) {
							authorMap.set(id, { fullName: user.fullName, role: user.role });
						}
					} catch {}
				}

				const data = (result.news || []).map((n) => ({
					id: n.id,
					title: n.title,
					content: n.content,
					authorId: n.authorId.value,
					published: n.published,
					createdAt: n.createdAt,
					updatedAt: n.updatedAt,
					authorName: authorMap.get(n.authorId.value)?.fullName,
					authorRole: authorMap.get(n.authorId.value)?.role,
				}));

				res.status(200).json({
					success: true,
					data,
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in get all news:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la récupération des actualités",
			});
		}
	}

	/**
	 * GET /api/news/:id
	 * Récupérer une actualité par ID
	 */
	async getById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const result = await this.getNewsUseCase.getById(id);

			if (result.success && result.news) {
				// Enrichir avec l'auteur
				const userRepository = new UserRepository();
				let authorName: string | undefined;
				let authorRole: string | undefined;
				try {
					const user = await userRepository.findById(result.news.authorId);
					if (user) {
						authorName = user.fullName;
						authorRole = user.role;
					}
				} catch {}

				res.status(200).json({
					success: true,
					data: {
						id: result.news.id,
						title: result.news.title,
						content: result.news.content,
						authorId: result.news.authorId.value,
						published: result.news.published,
						createdAt: result.news.createdAt,
						updatedAt: result.news.updatedAt,
						authorName,
						authorRole,
					},
				});
			} else {
				res.status(404).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in get news by id:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la récupération de l'actualité",
			});
		}
	}

	/**
	 * PUT /api/news/:id
	 * Mettre à jour une actualité (advisor/director seulement)
	 */
	async update(req: Request, res: Response): Promise<void> {
		try {
			const userRole = (req as any).user?.role;

			// Vérifier que l'utilisateur est advisor ou director
			if (!userRole || !["advisor", "director"].includes(userRole)) {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers et directeurs peuvent modifier des actualités.",
				});
				return;
			}

			const { id } = req.params;
			const dto: UpdateNewsDTO = {
				id,
				...req.body,
			};

			// Validation
			if (!dto.title || !dto.content) {
				res.status(400).json({
					success: false,
					error: "Titre et contenu sont requis",
				});
				return;
			}

			const result = await this.updateNewsUseCase.execute(dto);

			if (result.success) {
				res.status(200).json({
					success: true,
					message: "Actualité mise à jour avec succès",
					data: result.news,
				});
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in update news:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la mise à jour de l'actualité",
			});
		}
	}

	/**
	 * DELETE /api/news/:id
	 * Supprimer une actualité (advisor/director seulement)
	 */
	async delete(req: Request, res: Response): Promise<void> {
		try {
			const userRole = (req as any).user?.role;

			// Vérifier que l'utilisateur est advisor ou director
			if (!userRole || !["advisor", "director"].includes(userRole)) {
				res.status(403).json({
					success: false,
					error:
						"Accès refusé. Seuls les conseillers et directeurs peuvent supprimer des actualités.",
				});
				return;
			}

			const { id } = req.params;
			const result = await this.deleteNewsUseCase.execute(id);

			if (result.success) {
				res.status(200).json({
					success: true,
					message: "Actualité supprimée avec succès",
				});
			} else {
				res.status(404).json({
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			console.error("Error in delete news:", error);
			res.status(500).json({
				success: false,
				error: "Erreur serveur lors de la suppression de l'actualité",
			});
		}
	}
}
