import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IUserRepository } from "../../../Domain/repositories/IUserRepository";
import { User, UserRole } from "../../../Domain/entities/User";
import { UserId } from "../../../Domain/value-objects/UserId";
import { Email } from "../../../Domain/value-objects/Email";
import { pool } from "./connection";

interface UserRow extends RowDataPacket {
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
		const connection = await pool.getConnection();

		try {
			// Vérifier si l'utilisateur existe déjà
			const numericId = parseInt(user.id.value, 10);

			const [existing] = await connection.query<UserRow[]>(
				"SELECT id FROM users WHERE id = ?",
				[numericId]
			);

			if (existing.length > 0) {
				// Mise à jour
				await connection.query(
					`UPDATE users SET 
					email = ?,
					password_hash = ?,
					first_name = ?,
					last_name = ?,
					phone = ?,
					address = ?,
					role = ?,
					email_verified = ?,
					verification_token = ?,
					password_reset_token = ?,
					is_banned = ?,
					updated_at = ?
					WHERE id = ?`,
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
				// Insertion (l'ID sera auto-généré par MySQL)
				const [result] = await connection.query<ResultSetHeader>(
					`INSERT INTO users (
            email, password_hash, first_name, last_name, phone, address,
            role, email_verified, verification_token, password_reset_token, is_banned, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

				// Mettre à jour l'ID de l'utilisateur avec l'ID généré par MySQL
				// Note: On utilise la réflexion pour modifier l'ID (normalement immutable)
				(user as any).props.id = UserId.fromNumber(result.insertId);
			}
		} finally {
			connection.release();
		}
	}

	async findById(id: UserId): Promise<User | null> {
		const connection = await pool.getConnection();

		try {
			// Convertir l'ID en nombre pour MySQL
			const numericId = parseInt(id.value, 10);

			const [rows] = await connection.query<UserRow[]>(
				"SELECT * FROM users WHERE id = ?",
				[numericId]
			);

			if (rows.length === 0) {
				return null;
			}

			return this.mapRowToUser(rows[0]);
		} finally {
			connection.release();
		}
	}

	async findByEmail(email: Email): Promise<User | null> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<UserRow[]>(
				"SELECT * FROM users WHERE email = ?",
				[email.value]
			);

			if (rows.length === 0) {
				return null;
			}

			return this.mapRowToUser(rows[0]);
		} finally {
			connection.release();
		}
	}

	async findAll(): Promise<User[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<UserRow[]>(
				"SELECT * FROM users ORDER BY created_at DESC"
			);

			return rows.map((row) => this.mapRowToUser(row));
		} finally {
			connection.release();
		}
	}

	async findByRole(role: string): Promise<User[]> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<UserRow[]>(
				"SELECT * FROM users WHERE role = ?",
				[role]
			);

			return rows.map((row) => this.mapRowToUser(row));
		} finally {
			connection.release();
		}
	}

	async delete(id: UserId): Promise<void> {
		const connection = await pool.getConnection();

		try {
			await connection.query("DELETE FROM users WHERE id = ?", [id.value]);
		} finally {
			connection.release();
		}
	}

	async emailExists(email: Email): Promise<boolean> {
		const connection = await pool.getConnection();

		try {
			const [rows] = await connection.query<RowDataPacket[]>(
				"SELECT COUNT(*) as count FROM users WHERE email = ?",
				[email.value]
			);

			return rows[0].count > 0;
		} finally {
			connection.release();
		}
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
