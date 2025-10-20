import * as cron from "node-cron";
import { ApplyDailyInterest } from "../../Application/use-cases/account/ApplyDailyInterest";
import { AccountRepository } from "../database/mysql/AccountRepository";
import { MySQLTransactionRepository } from "../database/mysql/TransactionRepository";
import { BankSettingsRepository } from "../database/mysql/BankSettingsRepository";

/**
 * Service de tâches planifiées (Cron Jobs)
 * Responsable de l'exécution automatique des tâches périodiques
 */
export class CronService {
  private applyDailyInterestUseCase: ApplyDailyInterest;
  private jobs: Map<string, any> = new Map();

  constructor() {
    const accountRepository = new AccountRepository();
    const transactionRepository = new MySQLTransactionRepository();
    const bankSettingsRepository = new BankSettingsRepository();

    this.applyDailyInterestUseCase = new ApplyDailyInterest(
      accountRepository,
      transactionRepository,
      bankSettingsRepository
    );
  }

  /**
   * Démarre toutes les tâches planifiées
   */
  public start(): void {
    console.log("[CronService] Starting scheduled jobs...");

    // Tâche quotidienne: Appliquer les intérêts à 00:01 chaque jour
    this.scheduleDailyInterestJob();

    console.log("[CronService] All scheduled jobs started successfully");
  }

  /**
   * Arrête toutes les tâches planifiées
   */
  public stop(): void {
    console.log("[CronService] Stopping all scheduled jobs...");

    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`[CronService] Stopped job: ${name}`);
    });

    this.jobs.clear();
    console.log("[CronService] All jobs stopped");
  }

  /**
   * Planifie l'application quotidienne des intérêts
   * S'exécute tous les jours à 23:59
   */
  private scheduleDailyInterestJob(): void {
    const jobName = "daily-interest";

    // Cron expression: "minute heure jour mois jour_semaine"
    // "59 23 * * *" = tous les jours à 23:59
    const cronExpression = "59 23 * * *";

    const job = cron.schedule(
      cronExpression,
      async () => {
        console.log(`[CronService] Executing ${jobName} job...`);
        const startTime = Date.now();

        try {
          const result = await this.applyDailyInterestUseCase.execute();

          const duration = Date.now() - startTime;

          if (result.success) {
            console.log(
              `[CronService] ${jobName} completed successfully in ${duration}ms`
            );
            console.log(
              `[CronService] Processed ${result.processedAccounts} accounts, Total interest: ${result.totalInterestApplied.toFixed(2)}€`
            );

            if (result.errors.length > 0) {
              console.warn(
                `[CronService] ${jobName} completed with ${result.errors.length} errors:`,
                result.errors
              );
            }
          } else {
            console.error(
              `[CronService] ${jobName} failed after ${duration}ms`,
              result.errors
            );
          }
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(
            `[CronService] ${jobName} crashed after ${duration}ms:`,
            error
          );
        }
      },
      {
        timezone: "Europe/Paris",
      }
    );

    this.jobs.set(jobName, job);
    console.log(
      `[CronService] Scheduled job '${jobName}' with cron expression: ${cronExpression}`
    );
  }

  /**
   * Exécute manuellement l'application des intérêts (pour testing)
   */
  public async runDailyInterestNow(): Promise<any> {
    console.log("[CronService] Manual execution of daily interest job...");
    const result = await this.applyDailyInterestUseCase.execute();
    return result;
  }
}

// Export d'une instance singleton
let cronServiceInstance: CronService | null = null;

export function getCronService(): CronService {
  if (!cronServiceInstance) {
    cronServiceInstance = new CronService();
  }
  return cronServiceInstance;
}
