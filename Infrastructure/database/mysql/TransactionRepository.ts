import { ITransactionRepository } from "../../../Domain/repositories/ITransactionRepository";
import { Transaction } from "../../../Domain/entities/Transaction";
import { TransactionId } from "../../../Domain/value-objects/TransactionId";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { Money } from "../../../Domain/value-objects/Money";
import { TransactionType } from "../../../Domain/enums/TransactionType";
import { TransactionStatus } from "../../../Domain/enums/TransactionStatus";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "./connection";

interface TransactionRow extends RowDataPacket {
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

export class MySQLTransactionRepository implements ITransactionRepository {
	async save(transaction: Transaction): Promise<void> {
		const query = `
        INSERT INTO transactions (
            id, from_account_id, to_account_id, amount, currency, type, status, description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            updated_at = VALUES(updated_at)
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

		await pool.execute<ResultSetHeader>(query, values);
	}

	async findById(id: string): Promise<Transaction | null> {
		const query = `
      SELECT * FROM transactions WHERE id = ?
    `;

		const [rows] = await pool.execute<TransactionRow[]>(query, [id]);

		if (rows.length === 0) {
			return null;
		}

		return this.mapRowToEntity(rows[0]);
	}

	async findByAccountId(accountId: string): Promise<Transaction[]> {
		const query = `
        SELECT * FROM transactions 
        WHERE from_account_id = ? OR to_account_id = ?
        ORDER BY created_at DESC
    `;

		const [rows] = await pool.execute<TransactionRow[]>(query, [
			accountId,
			accountId,
		]);

		return rows.map((row: TransactionRow) => this.mapRowToEntity(row));
	}

	async findByUserId(userId: string): Promise<Transaction[]> {
		const query = `
        SELECT DISTINCT t.* 
        FROM transactions t
        LEFT JOIN accounts a1 ON t.from_account_id = a1.id
        LEFT JOIN accounts a2 ON t.to_account_id = a2.id
        WHERE a1.user_id = ? OR a2.user_id = ?
        ORDER BY t.created_at DESC
    `;

		const [rows] = await pool.execute<TransactionRow[]>(query, [
			userId,
			userId,
		]);

		return rows.map((row: TransactionRow) => this.mapRowToEntity(row));
	}

	private mapRowToEntity(row: TransactionRow): Transaction {
		return Transaction.reconstitute({
			id: TransactionId.create(row.id),
			fromAccountId: row.from_account_id
				? new AccountId(row.from_account_id)
				: null,
			toAccountId: row.to_account_id ? new AccountId(row.to_account_id) : null,
			amount: new Money(row.amount, row.currency),
			type: row.type as TransactionType,
			status: row.status as TransactionStatus,
			description: row.description,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
		});
	}
}
