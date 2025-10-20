import { IAccountRepository } from "../../../Domain/repositories/IAccountRepository";
import { ITransactionRepository } from "../../../Domain/repositories/ITransactionRepository";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { Money } from "../../../Domain/value-objects/Money";
import { Transaction } from "../../../Domain/entities/Transaction";
import { TransactionType } from "../../../Domain/enums/TransactionType";

export interface DepositMoneyDTO {
  accountId: string;
  amount: number;
  description?: string;
}

/**
 * Use Case: Déposer de l'argent sur un compte
 * 
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que le compte existe et est actif
 * - Créditer le compte
 * - Enregistrer la transaction de dépôt
 */
export class DepositMoney {
  constructor(
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(dto: DepositMoneyDTO): Promise<Transaction> {
    // Validation du montant
    if (dto.amount <= 0) {
      throw new Error("Le montant du dépôt doit être positif");
    }

    // Récupérer le compte
    const account = await this.accountRepository.findById(
      new AccountId(dto.accountId)
    );

    if (!account) {
      throw new Error("Compte introuvable");
    }

    if (!account.isActive) {
      throw new Error("Le compte n'est pas actif");
    }

    // Créer l'objet Money
    const depositAmount = new Money(dto.amount);

    // Créer la transaction de dépôt
    const transaction = Transaction.create(
      null, // Pas de compte source pour un dépôt
      account.id,
      depositAmount,
      TransactionType.DEPOSIT,
      dto.description || "Dépôt d'espèces"
    );

    try {
      // Créditer le compte
      account.credit(depositAmount);

      // Marquer la transaction comme complétée
      transaction.complete();

      // Sauvegarder les changements
      await this.accountRepository.save(account);
      await this.transactionRepository.save(transaction);

      return transaction;
    } catch (error) {
      // Marquer la transaction comme échouée
      transaction.fail();
      await this.transactionRepository.save(transaction);
      throw error;
    }
  }
}
