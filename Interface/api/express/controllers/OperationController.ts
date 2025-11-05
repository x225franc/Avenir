import { Request, Response } from "express";
import { AccountRepository } from "@infrastructure/database/mysql/AccountRepository";
import { TransactionRepository } from "../../../../Infrastructure/database/mysql/TransactionRepository";
import { DepositMoney } from "../../../../Application/use-cases/account/DepositMoney";
import { WithdrawMoney } from "../../../../Application/use-cases/account/WithdrawMoney";
import { Transaction } from "../../../../Domain/entities/Transaction";
import { AccountId } from "../../../../Domain/value-objects/AccountId";

/**
 * Controller pour les opérations de dépôt et retrait
 */
export class OperationController {
  private accountRepository: AccountRepository;
  private transactionRepository: TransactionRepository;
  private depositMoneyUseCase: DepositMoney;
  private withdrawMoneyUseCase: WithdrawMoney;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.transactionRepository = new TransactionRepository();
    this.depositMoneyUseCase = new DepositMoney(
      this.accountRepository,
      this.transactionRepository
    );
    this.withdrawMoneyUseCase = new WithdrawMoney(
      this.accountRepository,
      this.transactionRepository
    );
  }

  /**
   * POST /api/operations/deposit
   * Déposer de l'argent sur un compte
   */
  async deposit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Non autorisé",
        });
        return;
      }

      const { accountId, amount, description } = req.body;

      // Validation des données
      if (!accountId) {
        res.status(400).json({
          success: false,
          message: "L'identifiant du compte est requis",
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: "Le montant doit être supérieur à 0",
        });
        return;
      }

      // Vérifier que le compte appartient à l'utilisateur
      const account = await this.accountRepository.findById(new AccountId(accountId));
      if (!account) {
        res.status(404).json({
          success: false,
          message: "Compte introuvable",
        });
        return;
      }

      if (account.userId.value !== userId.toString()) {
        res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à effectuer cette opération",
        });
        return;
      }

      // Exécuter le dépôt
      const transaction = await this.depositMoneyUseCase.execute({
        accountId,
        amount,
        description,
      });

      res.status(201).json({
        success: true,
        message: "Dépôt effectué avec succès",
        data: this.formatTransactionResponse(transaction),
      });
    } catch (error) {
      console.error("Error in deposit:", error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Une erreur est survenue lors du dépôt",
        });
      }
    }
  }

  /**
   * POST /api/operations/withdraw
   * Retirer de l'argent d'un compte
   */
  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Non autorisé",
        });
        return;
      }

      const { accountId, amount, description } = req.body;

      // Validation des données
      if (!accountId) {
        res.status(400).json({
          success: false,
          message: "L'identifiant du compte est requis",
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: "Le montant doit être supérieur à 0",
        });
        return;
      }

      // Vérifier que le compte appartient à l'utilisateur
      const account = await this.accountRepository.findById(new AccountId(accountId));
      if (!account) {
        res.status(404).json({
          success: false,
          message: "Compte introuvable",
        });
        return;
      }

      if (account.userId.value !== userId.toString()) {
        res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à effectuer cette opération",
        });
        return;
      }

      // Exécuter le retrait
      const transaction = await this.withdrawMoneyUseCase.execute({
        accountId,
        amount,
        description,
      });

      res.status(201).json({
        success: true,
        message: "Retrait effectué avec succès",
        data: this.formatTransactionResponse(transaction),
      });
    } catch (error) {
      console.error("Error in withdraw:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("Solde insuffisant") ||
          error.message.includes("Insufficient balance")
        ) {
          res.status(400).json({
            success: false,
            message: "Solde insuffisant pour effectuer ce retrait",
          });
          return;
        }

        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Une erreur est survenue lors du retrait",
        });
      }
    }
  }

  private formatTransactionResponse(transaction: Transaction) {
    return {
      transactionId: transaction.getId().getValue(),
      fromAccountId: transaction.getFromAccountId()?.value || null,
      toAccountId: transaction.getToAccountId()?.value || null,
      amount: transaction.getAmount().amount,
      currency: transaction.getAmount().currency,
      type: transaction.getType(),
      status: transaction.getStatus().toLowerCase(),
      description: transaction.getDescription(),
      createdAt: transaction.getCreatedAt(),
    };
  }
}
