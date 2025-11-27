import { News } from "../entities/News";
import { UserId } from "../value-objects/UserId";

/**
 * Interface du repository pour les actualités
 */
export interface INewsRepository {
	/**
	 * Crée une nouvelle actualité
	 */
	create(news: News): Promise<News>;

	/**
	 * Trouve une actualité par son ID
	 */
	findById(id: string): Promise<News | null>;

	/**
	 * Trouve toutes les actualités
	 */
	findAll(): Promise<News[]>;

	/**
	 * Trouve toutes les actualités publiées
	 */
	findPublished(): Promise<News[]>;

	/**
	 * Trouve toutes les actualités d'un auteur
	 */
	findByAuthor(authorId: UserId): Promise<News[]>;

	/**
	 * Met à jour une actualité existante
	 */
	update(news: News): Promise<News>;

	/**
	 * Supprime une actualité
	 */
	delete(id: string): Promise<void>;
}
