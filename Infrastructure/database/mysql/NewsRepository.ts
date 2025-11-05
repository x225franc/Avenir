import { INewsRepository } from "@domain/repositories/INewsRepository";
import { News } from "@domain/entities/News";
import { UserId } from "@domain/value-objects/UserId";
import { pool } from "./connection";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface NewsRow extends RowDataPacket {
	id: number;
	title: string;
	content: string;
	author_id: number;
	published: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * Implémentation MySQL du repository pour les actualités
 */
export class NewsRepository implements INewsRepository {
	private mapRowToEntity(row: NewsRow): News {
		return new News(
			row.id.toString(),
			row.title,
			row.content,
			UserId.fromString(row.author_id.toString()),
			Boolean(row.published),
			new Date(row.created_at),
			new Date(row.updated_at)
		);
	}

	async create(news: News): Promise<News> {
		const query = `
			INSERT INTO news (title, content, author_id, published)
			VALUES (?, ?, ?, ?)
		`;

		const [result] = await pool.execute<ResultSetHeader>(query, [
			news.title,
			news.content,
			news.authorId.value,
			news.published,
		]);

		// Récupérer l'actualité créée
		const [rows] = await pool.execute<NewsRow[]>(
			"SELECT * FROM news WHERE id = ?",
			[result.insertId]
		);

		if (rows.length === 0) {
			throw new Error("Erreur lors de la création de l'actualité");
		}

		return this.mapRowToEntity(rows[0]);
	}

	async findById(id: string): Promise<News | null> {
		const query = "SELECT * FROM news WHERE id = ?";
		const [rows] = await pool.execute<NewsRow[]>(query, [id]);

		if (rows.length === 0) {
			return null;
		}

		return this.mapRowToEntity(rows[0]);
	}

	async findAll(): Promise<News[]> {
		const query = "SELECT * FROM news ORDER BY created_at DESC";
		const [rows] = await pool.execute<NewsRow[]>(query);

		return rows.map((row) => this.mapRowToEntity(row));
	}

	async findPublished(): Promise<News[]> {
		const query = `
			SELECT * FROM news 
			WHERE published = true 
			ORDER BY created_at DESC
		`;
		const [rows] = await pool.execute<NewsRow[]>(query);

		return rows.map((row) => this.mapRowToEntity(row));
	}

	async findByAuthor(authorId: UserId): Promise<News[]> {
		const query = `
			SELECT * FROM news 
			WHERE author_id = ? 
			ORDER BY created_at DESC
		`;
		const [rows] = await pool.execute<NewsRow[]>(query, [authorId.value]);

		return rows.map((row) => this.mapRowToEntity(row));
	}

	async update(news: News): Promise<News> {
		const query = `
			UPDATE news 
			SET title = ?, content = ?, published = ?, updated_at = NOW()
			WHERE id = ?
		`;

		await pool.execute(query, [
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
		const query = "DELETE FROM news WHERE id = ?";
		await pool.execute(query, [id]);
	}
}
