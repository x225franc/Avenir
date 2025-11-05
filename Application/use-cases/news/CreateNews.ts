import { INewsRepository } from "@domain/repositories/INewsRepository";
import { News } from "@domain/entities/News";
import { UserId } from "@domain/value-objects/UserId";

export interface CreateNewsDTO {
	title: string;
	content: string;
	authorId: string;
	published?: boolean;
}

export interface CreateNewsResult {
	success: boolean;
	news?: News;
	error?: string;
}

/**
 * Use Case: Créer une actualité
 */
export class CreateNews {
	constructor(private newsRepository: INewsRepository) {}

	async execute(dto: CreateNewsDTO): Promise<CreateNewsResult> {
		try {
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

			// Créer l'actualité
			const authorId = UserId.fromString(dto.authorId);
			const news = News.create(
				dto.title,
				dto.content,
				authorId,
				dto.published || false
			);

			// Enregistrer en base
			const createdNews = await this.newsRepository.create(news);

			return {
				success: true,
				news: createdNews,
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
