import { IAccountRepository } from "../../../Domain/repositories/IAccountRepository";
import { ITransactionRepository } from "../../../Domain/repositories/ITransactionRepository";
import { AccountId } from "../../../Domain/value-objects/AccountId";
import { Money } from "../../../Domain/value-objects/Money";
import { Transaction } from "../../../Domain/entities/Transaction";
import { TransactionType } from "../../../Domain/enums/TransactionType";

export interface WithdrawMoneyDTO {
  accountId: string;
  amount: number;
  description?: string;
}

/**
 * Use Case: Retirer de l'argent d'un compte
 * 
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que le compte existe et est actif
 * - Vérifier que le solde est suffisant
 * - Débiter le compte
 * - Enregistrer la transaction de retrait
 */
export class WithdrawMoney {
  constructor(
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(dto: WithdrawMoneyDTO): Promise<Transaction> {
    // Validation du montant
    if (dto.amount <= 0) {
      throw new Error("Le montant du retrait doit être positif");
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
    const withdrawAmount = new Money(dto.amount);

    // Vérifier le solde suffisant
    if (!account.hasEnoughBalance(withdrawAmount)) {
      throw new Error("Solde insuffisant pour effectuer ce retrait");
    }

    // Créer la transaction de retrait
    const transaction = Transaction.create(
      account.id,
      null, // Pas de compte destination pour un retrait
      withdrawAmount,
      TransactionType.WITHDRAWAL,
      dto.description || "Retrait d'espèces"
    );

    try {
      // Débiter le compte
      account.debit(withdrawAmount);

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
