import { INewsRepository } from "@domain/repositories/INewsRepository";
import { News } from "@domain/entities/News";

export interface GetNewsResult {
	success: boolean;
	news?: News[];
	error?: string;
}

/**
 * Use Case: Récupérer toutes les actualités ou seulement les publiées
 */
export class GetNews {
	constructor(private newsRepository: INewsRepository) {}

	async execute(publishedOnly: boolean = false): Promise<GetNewsResult> {
		try {
			const news = publishedOnly
				? await this.newsRepository.findPublished()
				: await this.newsRepository.findAll();

			return {
				success: true,
				news,
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

	async getById(id: string): Promise<{ success: boolean; news?: News; error?: string }> {
		try {
			const news = await this.newsRepository.findById(id);

			if (!news) {
				return {
					success: false,
					error: "Actualité non trouvée",
				};
			}

			return {
				success: true,
				news,
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
