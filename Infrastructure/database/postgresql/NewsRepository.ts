import { INewsRepository } from "@domain/repositories/INewsRepository";
import { News } from "@domain/entities/News";
import { UserId } from "@domain/value-objects/UserId";
import { pool } from "./connection";

interface NewsRow {
	id: number;
	title: string;
	content: string;
	author_id: number;
	published: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * Implémentation PostgreSQL du repository pour les actualités
 */
export class NewsRepository implements INewsRepository {
	private mapRowToEntity(row: NewsRow): News {
		return new News(
			row.id.toString(),
			row.title,
			row.content,
			UserId.fromNumber(row.author_id),
			Boolean(row.published),
			new Date(row.created_at),
			new Date(row.updated_at)
		);
	}

	async create(news: News): Promise<News> {
		const query = `
			INSERT INTO news (title, content, author_id, published)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`;

		const result = await pool.query(query, [
			news.title,
			news.content,
			news.authorId.value,
			news.published,
		]);

		// Récupérer l'actualité créée
		const newsResult = await pool.query(
			"SELECT * FROM news WHERE id = $1",
			[result.rows[0].id]
		);

		if (newsResult.rows.length === 0) {
			throw new Error("Erreur lors de la création de l'actualité");
		}

		return this.mapRowToEntity(newsResult.rows[0]);
	}

	async findById(id: string): Promise<News | null> {
		const query = "SELECT * FROM news WHERE id = $1";
		const result = await pool.query(query, [id]);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToEntity(result.rows[0]);
	}

	async findAll(): Promise<News[]> {
		const query = "SELECT * FROM news ORDER BY created_at DESC";
		const result = await pool.query(query);

		return result.rows.map((row) => this.mapRowToEntity(row));
	}

	async findPublished(): Promise<News[]> {
		const query = `
			SELECT * FROM news 
			WHERE published = true 
			ORDER BY created_at DESC
		`;
		const result = await pool.query(query);

		return result.rows.map((row) => this.mapRowToEntity(row));
	}

	async findByAuthor(authorId: UserId): Promise<News[]> {
		const query = `
			SELECT * FROM news 
			WHERE author_id = $1 
			ORDER BY created_at DESC
		`;
		const result = await pool.query(query, [authorId.value]);

		return result.rows.map((row) => this.mapRowToEntity(row));
	}

	async update(news: News): Promise<News> {
		const query = `
			UPDATE news 
			SET title = $1, content = $2, published = $3, updated_at = CURRENT_TIMESTAMP
			WHERE id = $4
		`;

		await pool.query(query, [
			news.title,
			news.content,
			news.published,
			news.id,
		]);

		// Récupérer l'actualité mise à jour
		const updated = await this.findById(news.id);
		if (!updated) {
			throw new Error("Actualité non trouvée après mise à jour");
		}

		return updated;
	}

	async delete(id: string): Promise<void> {
		const query = "DELETE FROM news WHERE id = $1";
		await pool.query(query, [id]);
	}
}