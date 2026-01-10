import { ICreditRepository } from "../../../Domain/repositories/ICreditRepository";
import { IAccountRepository } from "../../../Domain/repositories/IAccountRepository";
import { ITransactionRepository } from "../../../Domain/repositories/ITransactionRepository";
import { Transaction } from "../../../Domain/entities/Transaction";
import { TransactionId } from "../../../Domain/value-objects/TransactionId";
import { Money } from "../../../Domain/value-objects/Money";
import { TransactionType } from "../../../Domain/enums/TransactionType";
import { TransactionStatus } from "../../../Domain/enums/TransactionStatus";

export class ProcessMonthlyPayments {
	constructor(
		private creditRepository: ICreditRepository,
		private accountRepository: IAccountRepository,
		private transactionRepository: ITransactionRepository
	) {}

	async execute(): Promise<ProcessMonthlyPaymentsOutput> {
		const activeCredits = await this.creditRepository.findActiveCredits();

		const results = {
			processed: 0,
			failed: 0,
			errors: [] as string[],
		};

		for (const credit of activeCredits) {
			try {
				// Récupérer le compte du client
				const account = await this.accountRepository.findById(
					credit.getAccountId()
				);

				if (!account) {
					results.failed++;
					results.errors.push(
						`Account not found for credit ${credit.getId().getValue()}`
					);
					continue;
				}

				// Vérifier que le compte a suffisamment de fonds
				const monthlyPayment = credit.getMonthlyPayment();
				if (account.balance.amount < monthlyPayment.amount) {
					results.failed++;
					results.errors.push(
						`Insufficient funds for credit ${credit.getId().getValue()}`
					);
					// Marquer le crédit comme defaulted après 2 échecs consécutifs
					// (logique à implémenter selon les besoins métier)
					continue;
				}

				// Débiter le compte
				account.debit(monthlyPayment);
				await this.accountRepository.save(account);

				// Traiter le paiement sur le crédit
				credit.processMonthlyPayment();
				await this.creditRepository.update(credit);

				// Créer une transaction pour tracer le paiement
				const transaction = Transaction.create(
					credit.getAccountId(),
					null, // Pas de compte destination (paiement de crédit)
					monthlyPayment,
					TransactionType.WITHDRAWAL,
					`Remboursement mensuel crédit #${credit.getId().getValue()}`
				);
				transaction.complete();
				await this.transactionRepository.save(transaction);

				results.processed++;
			} catch (error) {
				results.failed++;
				results.errors.push(
					`Error processing credit ${credit.getId().getValue()}: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		}

		return {
			success: true,
			totalCredits: activeCredits.length,
			processed: results.processed,
			failed: results.failed,
			errors: results.errors,
		};
	}
}

export interface ProcessMonthlyPaymentsOutput {
	success: boolean;
	totalCredits: number;
	processed: number;
	failed: number;
	errors: string[];
}
