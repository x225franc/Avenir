import { ITransactionRepository } from "../../../Domain/repositories/ITransactionRepository";
import { Transaction } from "../../../Domain/entities/Transaction";
import { TransactionId } from "../../../Domain/value-objects/TransactionId";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { Money } from "../../../Domain/value-objects/Money";
import { TransactionType } from "../../../Domain/enums/TransactionType";
import { TransactionStatus } from "../../../Domain/enums/TransactionStatus";
import { pool } from "./connection";

interface TransactionRow {
	id: string;
	from_account_id: string | null;
	to_account_id: string | null;
	amount: number;
	currency: string;
	type: string;
	status: string;
	description: string | null;
	created_at: Date;
	updated_at: Date;
}

export class TransactionRepository implements ITransactionRepository {
	async save(transaction: Transaction): Promise<void> {
		const query = `
        INSERT INTO transactions (
            id, from_account_id, to_account_id, amount, currency, type, status, description, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) 
        DO UPDATE SET
            status = EXCLUDED.status,
            updated_at = EXCLUDED.updated_at
    `;

		const fromAccountId = transaction.getFromAccountId();
		const toAccountId = transaction.getToAccountId();
		
		const values = [
			transaction.getId().getValue(),
			fromAccountId ? fromAccountId.value : null,
			toAccountId ? toAccountId.value : null,
			transaction.getAmount().amount,
			transaction.getAmount().currency,
			transaction.getType(),
			transaction.getStatus(),
			transaction.getDescription(),
			transaction.getCreatedAt(),
			transaction.getUpdatedAt(),
		];

		await pool.query(query, values);
	}

	async findById(id: TransactionId): Promise<Transaction | null> {
		const query = `
      SELECT * FROM transactions WHERE id = $1
    `;

		const result = await pool.query(query, [id.getValue()]);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToEntity(result.rows[0]);
	}

	async findByUserId(userId: string): Promise<Transaction[]> {
		const query = `
        SELECT DISTINCT t.* 
        FROM transactions t
        LEFT JOIN accounts a1 ON t.from_account_id = a1.id
        LEFT JOIN accounts a2 ON t.to_account_id = a2.id
        WHERE a1.user_id = $1 OR a2.user_id = $2
        ORDER BY t.created_at DESC
    `;

		const result = await pool.query(query, [userId, userId]);

		return result.rows.map((row: TransactionRow) => this.mapRowToEntity(row));
	}

	async findAll(): Promise<Transaction[]> {
		const query = `
        SELECT * FROM transactions 
        ORDER BY created_at DESC
    `;

		const result = await pool.query(query, []);

		return result.rows.map((row: TransactionRow) => this.mapRowToEntity(row));
	}

	async findByStatus(status: string): Promise<Transaction[]> {
		const query = `
        SELECT * FROM transactions 
        WHERE status = $1
        ORDER BY created_at DESC
    `;

		const result = await pool.query(query, [status]);

		return result.rows.map((row: TransactionRow) => this.mapRowToEntity(row));
	}

	private mapRowToEntity(row: TransactionRow): Transaction {
		return Transaction.reconstitute({
			id: TransactionId.create(row.id),
			fromAccountId: row.from_account_id
				? new AccountId(row.from_account_id)
				: null,
			toAccountId: row.to_account_id ? new AccountId(row.to_account_id) : null,
			amount: new Money(row.amount, row.currency),
			type: row.type.toUpperCase() as TransactionType,
			status: row.status.toUpperCase() as TransactionStatus,
			description: row.description,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
		});
	}

	async update(transaction: Transaction): Promise<void> {
		const query = `
        UPDATE transactions 
        SET status = $1, description = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
    `;

		await pool.query(query, [
			transaction.getStatus(),
			transaction.getDescription(),
			transaction.getId().getValue(),
		]);
	}

	async delete(id: TransactionId): Promise<void> {
		const query = `DELETE FROM transactions WHERE id = $1`;
		await pool.query(query, [id.getValue()]);
	}

	async findByAccountId(accountId: string): Promise<Transaction[]> {
		const query = `
        SELECT * FROM transactions 
        WHERE from_account_id = $1 OR to_account_id = $2
        ORDER BY created_at DESC
    `;

		const result = await pool.query(query, [accountId, accountId]);

		return result.rows.map((row: TransactionRow) => this.mapRowToEntity(row));
	}
}