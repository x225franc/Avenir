import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "./connection";
import { Credit } from "../../../Domain/entities/Credit";
import { CreditId } from "../../../Domain/value-objects/CreditId";
import { UserId } from "../../../Domain/value-objects/UserId";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { Money } from "../../../Domain/value-objects/Money";
import { ICreditRepository } from "../../../Domain/repositories/ICreditRepository";

interface CreditRow extends RowDataPacket {
	id: number;
	user_id: number;
	account_id: number;
	advisor_id: number;
	principal_amount: string;
	annual_interest_rate: string;
	insurance_rate: string;
	duration_months: number;
	monthly_payment: string;
	remaining_balance: string;
	status: "active" | "paid_off" | "defaulted";
	created_at: Date;
	updated_at: Date;
}

export class CreditRepository implements ICreditRepository {
	async save(credit: Credit): Promise<void> {
		const query = `
			INSERT INTO credits (
				user_id, account_id, advisor_id, principal_amount,
				annual_interest_rate, insurance_rate, duration_months,
				monthly_payment, remaining_balance, status
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;

		const values = [
			parseInt(credit.getUserId().value),
			parseInt(credit.getAccountId().value),
			parseInt(credit.getAdvisorId().value),
			credit.getPrincipalAmount().amount,
			credit.getAnnualInterestRate(),
			credit.getInsuranceRate(),
			credit.getDurationMonths(),
			credit.getMonthlyPayment().amount,
			credit.getRemainingBalance().amount,
			credit.getStatus(),
		];

		await pool.execute(query, values);
	}

	async findById(id: CreditId): Promise<Credit | null> {
		const query = `SELECT * FROM credits WHERE id = ?`;
		const [rows] = await pool.execute<CreditRow[]>(query, [id.getValue()]);

		if (rows.length === 0) {
			return null;
		}

		return this.mapRowToCredit(rows[0]);
	}

	async findByUserId(userId: UserId): Promise<Credit[]> {
		const query = `SELECT * FROM credits WHERE user_id = ? ORDER BY created_at DESC`;
		const [rows] = await pool.execute<CreditRow[]>(query, [
			parseInt(userId.value),
		]);

		return rows.map((row: CreditRow) => this.mapRowToCredit(row));
	}

	async findByAdvisorId(advisorId: UserId): Promise<Credit[]> {
		const query = `SELECT * FROM credits WHERE advisor_id = ? ORDER BY created_at DESC`;
		const [rows] = await pool.execute<CreditRow[]>(query, [
			parseInt(advisorId.value),
		]);

		return rows.map((row: CreditRow) => this.mapRowToCredit(row));
	}

	async findActiveCredits(): Promise<Credit[]> {
		const query = `SELECT * FROM credits WHERE status = 'active' ORDER BY created_at ASC`;
		const [rows] = await pool.execute<CreditRow[]>(query);

		return rows.map((row: CreditRow) => this.mapRowToCredit(row));
	}

	async update(credit: Credit): Promise<void> {
		const query = `
			UPDATE credits
			SET remaining_balance = ?,
					status = ?,
					updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;

		const values = [
			credit.getRemainingBalance().amount,
			credit.getStatus(),
			credit.getId().getValue(),
		];

		await pool.execute(query, values);
	}

	async delete(id: CreditId): Promise<void> {
		const query = `DELETE FROM credits WHERE id = ?`;
		await pool.execute(query, [id.getValue()]);
	}

	private mapRowToCredit(row: CreditRow): Credit {
		return new Credit(
			new CreditId(row.id),
			UserId.fromNumber(row.user_id),
			AccountId.fromNumber(row.account_id),
			UserId.fromNumber(row.advisor_id),
			new Money(parseFloat(row.principal_amount)),
			parseFloat(row.annual_interest_rate),
			parseFloat(row.insurance_rate),
			row.duration_months,
			new Money(parseFloat(row.monthly_payment)),
			new Money(parseFloat(row.remaining_balance)),
			row.status,
			new Date(row.created_at),
			new Date(row.updated_at)
		);
	}
}
