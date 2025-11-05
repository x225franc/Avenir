import { INewsRepository } from "@domain/repositories/INewsRepository";

export interface DeleteNewsResult {
	success: boolean;
	error?: string;
}

/**
 * Use Case: Supprimer une actualité
 */
export class DeleteNews {
	constructor(private newsRepository: INewsRepository) {}

	async execute(id: string): Promise<DeleteNewsResult> {
		try {
			// Vérifier que l'actualité existe
			const existingNews = await this.newsRepository.findById(id);
			if (!existingNews) {
				return {
					success: false,
					error: "Actualité non trouvée",
				};
			}

			// Supprimer
			await this.newsRepository.delete(id);

			return {
				success: true,
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
