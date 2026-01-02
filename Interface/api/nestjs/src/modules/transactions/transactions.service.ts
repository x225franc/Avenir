import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransferDto } from './dto/transfer.dto';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { Money } from '@domain/value-objects/Money';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';

/**
 * ⚠️ VERSION SIMPLIFIÉE - SANS USE CASES
 *
 * Ce service utilise directement les repositories au lieu des Use Cases.
 * Voir SIMPLIFICATIONS.md pour la liste des Use Cases à réintégrer.
 *
 * Use Cases manquants:
 * - TransferMoneyUseCase (⚠️ CRITIQUE - logique métier complexe)
 * - GetUserTransactionsUseCase
 *
 * ATTENTION: La logique de transfert est complexe et devrait être dans un Use Case.
 * Cette implémentation directe est TEMPORAIRE pour les tests.
 */
@Injectable()
export class TransactionsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async transfer(userId: string, transferDto: TransferDto) {
    try {
      // 1. Trouver les comptes par IBAN
      const fromAccount = await this.accountRepository.findByIban(transferDto.fromIban);
      const toAccount = await this.accountRepository.findByIban(transferDto.toIban);

      if (!fromAccount) {
        throw new NotFoundException('Compte source non trouvé');
      }

      if (!toAccount) {
        throw new NotFoundException('Compte destinataire non trouvé');
      }

      // 2. Vérifier que l'utilisateur est propriétaire du compte source
      if (fromAccount.userId.value !== userId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à effectuer ce transfert');
      }

      // 3. Créer l'objet Money pour le montant
      const amount = new Money(transferDto.amount, 'EUR');

      // 4. Vérifier que le compte source a assez de fonds
      if (!fromAccount.hasEnoughBalance(amount)) {
        throw new BadRequestException('Solde insuffisant');
      }

      // 5. Débiter le compte source et créditer le compte destinataire
      fromAccount.debit(amount);
      toAccount.credit(amount);

      // 6. Créer la transaction
      const transaction = Transaction.create(
        fromAccount.id,
        toAccount.id,
        amount,
        TransactionType.TRANSFER,
        transferDto.description || null,
      );

      // 7. Marquer la transaction comme complétée
      transaction.complete();

      // 8. Sauvegarder tout (dans l'ordre : comptes puis transaction)
      await this.accountRepository.save(fromAccount);
      await this.accountRepository.save(toAccount);
      await this.transactionRepository.save(transaction);

      return {
        id: transaction.getId().getValue(),
        fromAccountId: transaction.getFromAccountId()?.value,
        toAccountId: transaction.getToAccountId()?.value,
        amount: transaction.getAmount().amount,
        type: transaction.getType(),
        status: transaction.getStatus(),
        description: transaction.getDescription(),
        createdAt: transaction.getCreatedAt(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue lors du transfert';
      throw new BadRequestException(message);
    }
  }

  async findByUserId(userId: string) {
    const transactions = await this.transactionRepository.findByUserId(userId);

    return transactions.map(transaction => ({
      id: transaction.getId().getValue(),
      fromAccountId: transaction.getFromAccountId()?.value,
      toAccountId: transaction.getToAccountId()?.value,
      amount: transaction.getAmount().amount,
      currency: transaction.getAmount().currency,
      type: transaction.getType(),
      status: transaction.getStatus(),
      description: transaction.getDescription(),
      createdAt: transaction.getCreatedAt(),
    }));
  }

  async findAll() {
    const transactions = await this.transactionRepository.findAll();

    return transactions.map(transaction => ({
      id: transaction.getId().getValue(),
      fromAccountId: transaction.getFromAccountId()?.value,
      toAccountId: transaction.getToAccountId()?.value,
      amount: transaction.getAmount().amount,
      currency: transaction.getAmount().currency,
      type: transaction.getType(),
      status: transaction.getStatus(),
      description: transaction.getDescription(),
      createdAt: transaction.getCreatedAt(),
    }));
  }

  async findByStatus(status: string) {
    const transactions = await this.transactionRepository.findByStatus(status);

    return transactions.map(transaction => ({
      id: transaction.getId().getValue(),
      fromAccountId: transaction.getFromAccountId()?.value,
      toAccountId: transaction.getToAccountId()?.value,
      amount: transaction.getAmount().amount,
      type: transaction.getType(),
      status: transaction.getStatus(),
      description: transaction.getDescription(),
      createdAt: transaction.getCreatedAt(),
    }));
  }
}
