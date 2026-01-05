import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransferDto } from './dto/transfer.dto';
import { IbanTransferDto } from './dto/iban-transfer.dto';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { Money } from '@domain/value-objects/Money';
import { Transaction } from '@domain/entities/Transaction';
import { TransactionType } from '@domain/enums/TransactionType';
import { AccountId } from '@domain/value-objects/AccountId';
import { TransferMoney } from '@application/use-cases/account/TransferMoney';
@Injectable()
export class TransactionsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async transfer(userId: string, transferDto: TransferDto) {
    try {
      // 1. Trouver les comptes par IBAN pour récupérer les IDs
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

      // 3. Utiliser le Use Case TransferMoney
      const transferUseCase = new TransferMoney(
        this.accountRepository,
        this.transactionRepository
      );

      const result = await transferUseCase.execute({
        sourceAccountId: fromAccount.id.value,
        destinationAccountId: toAccount.id.value,
        amount: transferDto.amount,
        currency: 'EUR',
        description: transferDto.description,
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors du transfert');
      }

      // 4. Récupérer la transaction créée pour la retourner
      const transaction = await this.transactionRepository.findById(
        { getValue: () => result.transactionId } as any
      );

      return {
        id: result.transactionId,
        fromAccountId: fromAccount.id.value,
        toAccountId: toAccount.id.value,
        amount: transferDto.amount,
        type: 'TRANSFER',
        status: 'COMPLETED',
        description: transferDto.description,
        createdAt: new Date(),
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

  async findByAccountId(accountId: string) {
    const transactions = await this.transactionRepository.findByAccountId(accountId);

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

  async lookupAccountByIban(iban: string) {
    const account = await this.accountRepository.findByIban(iban);

    if (!account) {
      throw new NotFoundException('Compte non trouvé pour cet IBAN');
    }

    return {
      id: account.id.value,
      iban: account.iban.value,
      accountName: account.accountName,
      accountType: account.accountType,
    };
  }

  async transferToExternalIban(userId: string, ibanTransferDto: IbanTransferDto) {
    try {
      // 1. Vérifier que le compte source existe et appartient à l'utilisateur
      const fromAccount = await this.accountRepository.findById(new AccountId(ibanTransferDto.fromAccountId));

      if (!fromAccount) {
        throw new NotFoundException('Compte source non trouvé');
      }

      if (fromAccount.userId.value !== userId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à effectuer ce transfert');
      }

      // 2. Créer l'objet Money pour le montant
      const amount = new Money(ibanTransferDto.amount, 'EUR');

      // 3. Vérifier que le compte source a assez de fonds
      if (!fromAccount.hasEnoughBalance(amount)) {
        throw new BadRequestException('Solde insuffisant');
      }

      // 4. Débiter le compte source
      fromAccount.debit(amount);

      // 5. Créer la transaction (transfert externe = pas de toAccountId)
      const transaction = Transaction.create(
        fromAccount.id,
        null, // Pas de compte destination pour un IBAN externe
        amount,
        TransactionType.TRANSFER,
        ibanTransferDto.description || `Transfert vers ${ibanTransferDto.externalIban}`,
      );

      // 6. Marquer la transaction comme complétée
      transaction.complete();

      // 7. Sauvegarder
      await this.accountRepository.save(fromAccount);
      await this.transactionRepository.save(transaction);

      return {
        id: transaction.getId().getValue(),
        fromAccountId: transaction.getFromAccountId()?.value,
        externalIban: ibanTransferDto.externalIban,
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
}
