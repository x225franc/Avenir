import { INewsRepository } from "@domain/repositories/INewsRepository";
import { News } from "@domain/entities/News";

export interface UpdateNewsDTO {
	id: string;
	title: string;
	content: string;
	published?: boolean;
}

export interface UpdateNewsResult {
	success: boolean;
	news?: News;
	error?: string;
}

/**
 * Use Case: Mettre à jour une actualité
 */
export class UpdateNews {
	constructor(private newsRepository: INewsRepository) {}

	async execute(dto: UpdateNewsDTO): Promise<UpdateNewsResult> {
		try {
			// Vérifier que l'actualité existe
			const existingNews = await this.newsRepository.findById(dto.id);
			if (!existingNews) {
				return {
					success: false,
					error: "Actualité non trouvée",
				};
			}

			// Validation
			if (!dto.title || dto.title.trim().length === 0) {
				return {
					success: false,
					error: "Le titre est requis",
				};
			}

			if (!dto.content || dto.content.trim().length === 0) {
				return {
					success: false,
					error: "Le contenu est requis",
				};
			}

			// Mettre à jour
			let updatedNews = existingNews.update(dto.title, dto.content);

			// Gérer la publication/dépublication
			if (dto.published !== undefined) {
				updatedNews = dto.published
					? updatedNews.publish()
					: updatedNews.unpublish();
			}

			// Enregistrer en base
			const savedNews = await this.newsRepository.update(updatedNews);

			return {
				success: true,
				news: savedNews,
			};
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: false,
				error: "Une erreur inattendue s'est produite",
			};
		}
	}
}
