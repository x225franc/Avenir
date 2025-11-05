import { News } from "@domain/entities/News";
import { UserId } from "@domain/value-objects/UserId";

/**
 * Interface du repository pour les actualités
 */
export interface INewsRepository {
	/**
	 * Créer une nouvelle actualité
	 */
	create(news: News): Promise<News>;

	/**
	 * Trouver une actualité par ID
	 */
	findById(id: string): Promise<News | null>;

	/**
	 * Trouver toutes les actualités
	 */
	findAll(): Promise<News[]>;

	/**
	 * Trouver toutes les actualités publiées
	 */
	findPublished(): Promise<News[]>;

	/**
	 * Trouver toutes les actualités d'un auteur
	 */
	findByAuthor(authorId: UserId): Promise<News[]>;

	/**
	 * Mettre à jour une actualité
	 */
	update(news: News): Promise<News>;

	/**
	 * Supprimer une actualité
	 */
	delete(id: string): Promise<void>;
}
