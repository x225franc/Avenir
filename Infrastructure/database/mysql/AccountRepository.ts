import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { IAccountRepository } from "@domain/repositories/IAccountRepository";
import { Account, AccountType } from "@domain/entities/Account";
import { AccountId } from "@domain/value-objects/AccountId";
import { UserId } from "@domain/value-objects/UserId";
import { IBAN } from "@domain/value-objects/IBAN";
import { Money } from "@domain/value-objects/Money";
import { pool } from "./connection";

interface AccountRow extends RowDataPacket {
	id: number;
	user_id: number;
	iban: string;
	account_name: string;
	account_type: string;
	balance: number;
	is_active: number;
	created_at: Date;
	updated_at: Date;
}

/**
 * Implémentation MySQL du repository Account
 */
export class AccountRepository implements IAccountRepository {
	/**
	 * Sauvegarde un compte (création ou mise à jour)
	 */
	async save(account: Account): Promise<void> {
		const connection = await pool.getConnection();

		try {
			// Vérifier si le compte existe
			const [rows] = await connection.execute<AccountRow[]>(
				"SELECT id FROM accounts WHERE id = ?",
				[account.id.value]
			);

			if (rows.length > 0) {
				// Mise à jour
				await connection.execute(
					`UPDATE accounts 
					SET account_name = ?, account_type = ?, balance = ?,
					updated_at = NOW() WHERE id = ?`,
					[
						account.accountName,
						account.accountType,
						account.balance.amount,
						account.id.value,
					]
				);
			} else {
				// Création (l'ID sera auto-généré par MySQL)
				const [result] = await connection.execute<ResultSetHeader>(
					`INSERT INTO accounts 
					(user_id, iban, account_name, account_type, balance, is_active, created_at, updated_at)
					VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
					[
						account.userId.value,
						account.iban.value,
						account.accountName,
						account.accountType,
						account.balance.amount,
					]
				);

				// Mettre à jour l'ID de l'account avec l'ID généré par MySQL
				(account as any).props.id = new AccountId(result.insertId.toString());
			}
		} finally {
			connection.release();
		}
	}

	/**
	 * Trouve un compte par son ID
	 */
	async findById(id: AccountId): Promise<Account | null> {
		const [rows] = await pool.execute<AccountRow[]>(
			"SELECT * FROM accounts WHERE id = ?",
			[id.value]
		);

		if (rows.length === 0) {
			return null;
		}

		return this.mapRowToAccount(rows[0]);
	}

	/**
	 * Trouve un compte par son IBAN
	 */
	async findByIBAN(iban: IBAN): Promise<Account | null> {
		const [rows] = await pool.execute<AccountRow[]>(
			"SELECT * FROM accounts WHERE iban = ?",
			[iban.value]
		);

		if (rows.length === 0) {
			return null;
		}

		return this.mapRowToAccount(rows[0]);
	}

	/**
	 * Trouve tous les comptes d'un utilisateur
	 */
	async findByUserId(userId: UserId): Promise<Account[]> {
		const [rows] = await pool.execute<AccountRow[]>(
			"SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC",
			[userId.value]
		);

		return rows.map((row) => this.mapRowToAccount(row));
	}

	/**
	 * Trouve les comptes d'un utilisateur par type
	 */
	async findByUserIdAndType(
		userId: UserId,
		type: AccountType
	): Promise<Account[]> {
		const [rows] = await pool.execute<AccountRow[]>(
			"SELECT * FROM accounts WHERE user_id = ? AND type = ? ORDER BY created_at DESC",
			[userId.value, type]
		);

		return rows.map((row) => this.mapRowToAccount(row));
	}

	/**
	 * Trouve tous les comptes d'épargne actifs (pour appliquer les intérêts)
	 */
	async findAllSavingsAccounts(): Promise<Account[]> {
		const [rows] = await pool.execute<AccountRow[]>(
			"SELECT * FROM accounts WHERE account_type = ?",
			[AccountType.SAVINGS]
		);

		return rows.map((row) => this.mapRowToAccount(row));
	}

	/**
	 * Supprime un compte
	 */
	async delete(id: AccountId): Promise<void> {
		await pool.execute("DELETE FROM accounts WHERE id = ?", [id.value]);
	}

	/**
	 * Vérifie si un IBAN existe déjà
	 */
	async ibanExists(iban: IBAN): Promise<boolean> {
		const [rows] = await pool.execute<AccountRow[]>(
			"SELECT id FROM accounts WHERE iban = ?",
			[iban.value]
		);

		return rows.length > 0;
	}

	/**
	 * Convertit une ligne de base de données en entité Account
	 */
	private mapRowToAccount(row: any): Account {
		return Account.fromPersistence({
			id: new AccountId(row.id.toString()),
			userId: new UserId(row.user_id.toString()),
			iban: new IBAN(row.iban),
			accountName: row.account_name,
			accountType: row.account_type as AccountType,
			balance: new Money(row.balance, "EUR"),
			isActive: row.is_active === 1,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}
}
