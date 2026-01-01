import { IUserRepository } from "../../../Domain/repositories/IUserRepository";
import { User, UserRole } from "../../../Domain/entities/User";
import { UserId } from "../../../Domain/value-objects/UserId";
import { Email } from "../../../Domain/value-objects/Email";
import { pool } from "./connection";

interface UserRow {
	id: number;
	email: string;
	password_hash: string;
	first_name: string;
	last_name: string;
	phone: string | null;
	address: string | null;
	role: UserRole;
	email_verified: boolean;
	verification_token: string | null;
	password_reset_token: string | null;
	is_banned: boolean;
	created_at: Date;
	updated_at: Date;
}

export class UserRepository implements IUserRepository {
	async save(user: User): Promise<void> {
		const client = await pool.connect();

		try {
			// Vérifier si l'utilisateur existe déjà
			const numericId = parseInt(user.id.value, 10);

			const existingResult = await client.query(
				"SELECT id FROM users WHERE id = $1",
				[numericId]
			);

			if (existingResult.rows.length > 0) {
				// Mise à jour
				await client.query(
					`UPDATE users SET 
					email = $1,
					password_hash = $2,
					first_name = $3,
					last_name = $4,
					phone = $5,
					address = $6,
					role = $7,
					email_verified = $8,
					verification_token = $9,
					password_reset_token = $10,
					is_banned = $11,
					updated_at = $12
					WHERE id = $13`,
					[
						user.email.value,
						user.passwordHash,
						user.firstName,
						user.lastName,
						user.phone || null,
						user.address || null,
						user.role,
						user.emailVerified,
						user.verificationToken || null,
						user.passwordResetToken || null,
						user.isBanned,
						user.updatedAt,
						numericId,
					]
				);
			} else {
				// Insertion (l'ID sera auto-généré par PostgreSQL)
				const result = await client.query(
					`INSERT INTO users (
            email, password_hash, first_name, last_name, phone, address,
            role, email_verified, verification_token, password_reset_token, is_banned, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id`,
					[
						user.email.value,
						user.passwordHash,
						user.firstName,
						user.lastName,
						user.phone || null,
						user.address || null,
						user.role,
						user.emailVerified,
						user.verificationToken || null,
						user.passwordResetToken || null,
						user.isBanned,
						user.createdAt,
						user.updatedAt,
					]
				);

				// Mettre à jour l'ID de l'utilisateur avec l'ID généré par PostgreSQL
				// Note: On utilise la réflexion pour modifier l'ID (normalement immutable)
				(user as any).props.id = UserId.fromNumber(result.rows[0].id);
			}
		} finally {
			client.release();
		}
	}

	async findById(id: UserId): Promise<User | null> {
		// Convertir l'ID en nombre pour PostgreSQL
		const numericId = parseInt(id.value, 10);

		const result = await pool.query(
			"SELECT * FROM users WHERE id = $1",
			[numericId]
		);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToUser(result.rows[0]);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const result = await pool.query(
			"SELECT * FROM users WHERE email = $1",
			[email.value]
		);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToUser(result.rows[0]);
	}

	async findAll(): Promise<User[]> {
		const result = await pool.query(
			"SELECT * FROM users ORDER BY created_at DESC"
		);

		return result.rows.map((row) => this.mapRowToUser(row));
	}

	async findByRole(role: string): Promise<User[]> {
		const result = await pool.query(
			"SELECT * FROM users WHERE role = $1",
			[role]
		);

		return result.rows.map((row) => this.mapRowToUser(row));
	}

	async delete(id: UserId): Promise<void> {
		await pool.query("DELETE FROM users WHERE id = $1", [parseInt(id.value)]);
	}

	async emailExists(email: Email): Promise<boolean> {
		const result = await pool.query(
			"SELECT COUNT(*) as count FROM users WHERE email = $1",
			[email.value]
		);

		return parseInt(result.rows[0].count) > 0;
	}

    async findByVerificationToken(token: string): Promise<User | null> {
		const result = await pool.query(
			"SELECT * FROM users WHERE verification_token = $1",
			[token]
		);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToUser(result.rows[0]);
	}

	private mapRowToUser(row: UserRow): User {
		return User.fromPersistence({
			id: UserId.fromNumber(row.id),
			email: new Email(row.email),
			passwordHash: row.password_hash,
			firstName: row.first_name,
			lastName: row.last_name,
			phone: row.phone || undefined,
			address: row.address || undefined,
			role: row.role,
			emailVerified: Boolean(row.email_verified),
			verificationToken: row.verification_token || undefined,
			passwordResetToken: row.password_reset_token || undefined,
			isBanned: Boolean(row.is_banned),
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
		});
	}
}