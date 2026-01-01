import { Pool } from "pg";
import { IAccountRepository } from "@domain/repositories/IAccountRepository";
import { Account, AccountType } from "@domain/entities/Account";
import { AccountId } from "@domain/value-objects/AccountId";
import { UserId } from "@domain/value-objects/UserId";
import { IBAN } from "@domain/value-objects/IBAN";
import { Money } from "@domain/value-objects/Money";
import { pool } from "./connection";

interface AccountRow {
	id: number;
	user_id: number;
	iban: string;
	account_name: string;
	account_type: string;
	balance: number;
	is_active: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * Implémentation PostgreSQL du repository Account
 */
export class AccountRepository implements IAccountRepository {
	/**
	 * Sauvegarde un compte (création ou mise à jour)
	 */
	async save(account: Account): Promise<void> {
		const client = await pool.connect();

		try {
			// Vérifier si le compte existe
			const existingResult = await client.query(
				"SELECT id FROM accounts WHERE id = $1",
				[account.id.value]
			);

			if (existingResult.rows.length > 0) {
				// Mise à jour
				await client.query(
					`UPDATE accounts 
					SET account_name = $1, account_type = $2, balance = $3,
					updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
					[
						account.accountName,
						account.accountType,
						account.balance.amount,
						account.id.value,
					]
				);
			} else {
				// Création (l'ID sera auto-généré par PostgreSQL)
				const result = await client.query(
					`INSERT INTO accounts 
					(user_id, iban, account_name, account_type, balance, is_active, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
					RETURNING id`,
					[
						account.userId.value,
						account.iban.value,
						account.accountName,
						account.accountType,
						account.balance.amount,
					]
				);

				// Mettre à jour l'ID de l'account avec l'ID généré par PostgreSQL
				(account as any).props.id = new AccountId(result.rows[0].id.toString());
			}
		} finally {
			client.release();
		}
	}

	/**
	 * Trouve un compte par son ID
	 */
	async findById(id: AccountId): Promise<Account | null> {
		const result = await pool.query(
			"SELECT * FROM accounts WHERE id = $1",
			[id.value]
		);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToAccount(result.rows[0]);
	}

	/**
	 * Trouve un compte par son IBAN
	 */
	async findByIBAN(iban: IBAN): Promise<Account | null> {
		const result = await pool.query(
			"SELECT * FROM accounts WHERE iban = $1",
			[iban.value]
		);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToAccount(result.rows[0]);
	}

	/**
	 * Trouve un compte par son IBAN (string)
	 */
	async findByIban(iban: string): Promise<Account | null> {
		const result = await pool.query(
			"SELECT * FROM accounts WHERE iban = $1",
			[iban]
		);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToAccount(result.rows[0]);
	}

	/**
	 * Trouve tous les comptes d'un utilisateur
	 */
	async findByUserId(userId: UserId): Promise<Account[]> {
		const result = await pool.query(
			"SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC",
			[userId.value]
		);

		return result.rows.map((row) => this.mapRowToAccount(row));
	}

	/**
	 * Trouve les comptes d'un utilisateur par type
	 */
	async findByUserIdAndType(
		userId: UserId,
		type: AccountType
	): Promise<Account[]> {
		const result = await pool.query(
			"SELECT * FROM accounts WHERE user_id = $1 AND account_type = $2 ORDER BY created_at DESC",
			[userId.value, type]
		);

		return result.rows.map((row) => this.mapRowToAccount(row));
	}

	/**
	 * Trouve tous les comptes d'épargne actifs (pour appliquer les intérêts)
	 */
	async findAllSavingsAccounts(): Promise<Account[]> {
		const result = await pool.query(
			"SELECT * FROM accounts WHERE account_type = $1",
			[AccountType.SAVINGS]
		);

		return result.rows.map((row) => this.mapRowToAccount(row));
	}

	/**
	 * Supprime un compte
	 */
	async delete(id: AccountId): Promise<void> {
		await pool.query("DELETE FROM accounts WHERE id = $1", [parseInt(id.value)]);
	}

	/**
	 * Vérifie si un IBAN existe déjà
	 */
	async ibanExists(iban: IBAN): Promise<boolean> {
		const result = await pool.query(
			"SELECT id FROM accounts WHERE iban = $1",
			[iban.value]
		);

		return result.rows.length > 0;
	}

	/**
	 * Convertit une ligne de base de données en entité Account
	 */
	private mapRowToAccount(row: AccountRow): Account {
		return Account.fromPersistence({
			id: new AccountId(row.id.toString()),
			userId: new UserId(row.user_id.toString()),
			iban: new IBAN(row.iban),
			accountName: row.account_name,
			accountType: row.account_type as AccountType,
			balance: new Money(row.balance, "EUR"),
			isActive: row.is_active,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}
}
