import { UserId } from "@domain/value-objects/UserId";

/**
 * Entité News (Actualité)
 * 
 * Représente une actualité publiée par un conseiller ou directeur
 */
export class News {
	constructor(
		public readonly id: string,
		public readonly title: string,
		public readonly content: string,
		public readonly authorId: UserId,
		public readonly published: boolean,
		public readonly createdAt: Date,
		public readonly updatedAt: Date
	) {
		this.validate();
	}

	private validate(): void {
		if (!this.title || this.title.trim().length === 0) {
			throw new Error("Le titre de l'actualité est requis");
		}

		if (this.title.length > 255) {
			throw new Error("Le titre ne peut pas dépasser 255 caractères");
		}

		if (!this.content || this.content.trim().length === 0) {
			throw new Error("Le contenu de l'actualité est requis");
		}

		if (this.content.length > 10000) {
			throw new Error("Le contenu ne peut pas dépasser 10000 caractères");
		}
	}

	/**
	 * Crée une nouvelle actualité
	 */
	static create(
		title: string,
		content: string,
		authorId: UserId,
		published: boolean = false
	): News {
		return new News(
			"", // L'ID sera généré par la base de données
			title,
			content,
			authorId,
			published,
			new Date(),
			new Date()
		);
	}

	/**
	 * Publie l'actualité
	 */
	publish(): News {
		return new News(
			this.id,
			this.title,
			this.content,
			this.authorId,
			true,
			this.createdAt,
			new Date()
		);
	}

	/**
	 * Dépublie l'actualité
	 */
	unpublish(): News {
		return new News(
			this.id,
			this.title,
			this.content,
			this.authorId,
			false,
			this.createdAt,
			new Date()
		);
	}

	/**
	 * Met à jour le titre et le contenu
	 */
	update(title: string, content: string): News {
		return new News(
			this.id,
			title,
			content,
			this.authorId,
			this.published,
			this.createdAt,
			new Date()
		);
	}
}
