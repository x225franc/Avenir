import { IAccountRepository } from "../../../Domain/repositories/IAccountRepository";
import { ITransactionRepository } from "../../../Domain/repositories/ITransactionRepository";
import { IBankSettingsRepository } from "../../../Domain/repositories/IBankSettingsRepository";
import { AccountType } from "../../../Domain/entities/Account";
import { Transaction } from "../../../Domain/entities/Transaction";
import { TransactionType } from "../../../Domain/enums/TransactionType";
import { Money } from "../../../Domain/value-objects/Money";

/**
 * Use Case: Appliquer les intérêts quotidiens aux comptes d'épargne
 * 
 * Responsabilités:
 * - Récupérer le taux d'intérêt depuis bank_settings
 * - Récupérer tous les comptes d'épargne actifs
 * - Appliquer le taux d'intérêt quotidien à chaque compte
 * - Enregistrer les transactions d'intérêt
 * - Logger les résultats
 */
export class ApplyDailyInterest {
  constructor(
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository,
    private bankSettingsRepository: IBankSettingsRepository
  ) {}

  async execute(): Promise<{
    success: boolean;
    processedAccounts: number;
    totalInterestApplied: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processedAccounts = 0;
    let totalInterestApplied = 0;

    try {
      console.log("[ApplyDailyInterest] Starting daily interest application...");

      // Récupérer le taux d'intérêt depuis bank_settings
      const savingsRate = await this.bankSettingsRepository.getSavingsRate();
      console.log(`[ApplyDailyInterest] Current savings rate: ${savingsRate}%`);

      if (savingsRate <= 0) {
        console.log("[ApplyDailyInterest] No interest rate configured, skipping...");
        return {
          success: true,
          processedAccounts: 0,
          totalInterestApplied: 0,
          errors: ["No interest rate configured in bank_settings"],
        };
      }

      // Récupérer tous les comptes d'épargne actifs
      const allAccounts = await this.accountRepository.findAllSavingsAccounts();

      console.log(`[ApplyDailyInterest] Found ${allAccounts.length} savings accounts`);

      for (const account of allAccounts) {
        try {
          // Vérifier que c'est un compte d'épargne actif
          if (account.accountType !== AccountType.SAVINGS || !account.isActive) {
            continue;
          }

          // Calculer les intérêts avec le taux centralisé
          const balanceBeforeInterest = account.balance.amount;
          
          // Calcul des intérêts journaliers
          // Formule: Solde × (Taux% / 100) / 365 jours
          const annualRateDecimal = savingsRate / 100;
          const dailyRate = annualRateDecimal / 365;
          const interestAmount = balanceBeforeInterest * dailyRate;

          console.log(`[ApplyDailyInterest] Account ${account.id.value}: balance=${balanceBeforeInterest}€, rate=${savingsRate}%, dailyInterest=${interestAmount.toFixed(4)}€`);

          // Seuls les montants > 0.01€ (1 centime) sont traités
          if (interestAmount >= 0.01) {
            // Appliquer les intérêts au compte
            account.credit(new Money(interestAmount));
            // Sauvegarder le compte avec le nouveau solde
            await this.accountRepository.save(account);

            // Créer une transaction d'intérêt
            const transaction = Transaction.create(
              null, // Pas de compte source pour les intérêts
              account.id,
              new Money(interestAmount),
              TransactionType.INTEREST,
              `Intérêts quotidiens ` // taux de ${savingsRate}%
            );

            transaction.complete();
            await this.transactionRepository.save(transaction);

            processedAccounts++;
            totalInterestApplied += interestAmount;

            console.log(
              `[ApplyDailyInterest] Applied ${interestAmount.toFixed(2)}€ interest to account ${account.id.value}`
            );
          }
        } catch (error) {
          const errorMessage = `Error processing account ${account.id.value}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          errors.push(errorMessage);
          console.error(`[ApplyDailyInterest] ${errorMessage}`);
        }
      }

      console.log(
        `[ApplyDailyInterest] Completed. Processed ${processedAccounts} accounts, Total interest: ${totalInterestApplied.toFixed(
          2
        )}€`
      );

      return {
        success: true,
        processedAccounts,
        totalInterestApplied,
        errors,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[ApplyDailyInterest] Critical error: ${errorMessage}`);

      return {
        success: false,
        processedAccounts,
        totalInterestApplied,
        errors: [...errors, errorMessage],
      };
    }
  }
}
