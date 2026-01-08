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
      // 1. Vérifier que le compte source appartient à l'utilisateur
      const sourceAccount = await this.accountRepository.findById(
        new AccountId(transferDto.sourceAccountId)
      );

      if (!sourceAccount) {
        throw new NotFoundException('Compte source non trouvé');
      }

      if (sourceAccount.userId.value !== userId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à effectuer ce transfert');
      }

      // 2. Vérifier que le compte destination existe
      const destinationAccount = await this.accountRepository.findById(
        new AccountId(transferDto.destinationAccountId)
      );

      if (!destinationAccount) {
        throw new NotFoundException('Compte destinataire non trouvé');
      }

      // 3. Utiliser le Use Case TransferMoney
      const transferUseCase = new TransferMoney(
        this.accountRepository,
        this.transactionRepository
      );

      const result = await transferUseCase.execute({
        sourceAccountId: transferDto.sourceAccountId,
        destinationAccountId: transferDto.destinationAccountId,
        amount: transferDto.amount,
        currency: transferDto.currency,
        description: transferDto.description,
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors du transfert');
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Transfert effectué avec succès',
        data: {
          transactionId: result.transactionId,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors du transfert');
    }
  }

  async findByUserId(userId: string) {
    const transactions = await this.transactionRepository.findByUserId(userId);

    // Format standardisé compatible avec Express
    return {
      success: true,
      data: transactions.map(transaction => ({
        id: transaction.getId().getValue(),
        fromAccountId: transaction.getFromAccountId()?.value || null,
        toAccountId: transaction.getToAccountId()?.value || null,
        amount: transaction.getAmount().amount,
        currency: transaction.getAmount().currency,
        type: transaction.getType(),
        status: transaction.getStatus(),
        description: transaction.getDescription(),
        createdAt: transaction.getCreatedAt(),
        updatedAt: transaction.getUpdatedAt(),
      })),
    };
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

    // Format standardisé compatible avec Express
    return {
      success: true,
      data: transactions.map(transaction => ({
        id: transaction.getId().getValue(),
        fromAccountId: transaction.getFromAccountId()?.value || null,
        toAccountId: transaction.getToAccountId()?.value || null,
        amount: transaction.getAmount().amount,
        currency: transaction.getAmount().currency,
        type: transaction.getType(),
        status: transaction.getStatus(),
        description: transaction.getDescription(),
        createdAt: transaction.getCreatedAt(),
        updatedAt: transaction.getUpdatedAt(),
      })),
    };
  }

  async lookupAccountByIban(iban: string) {
    // Validation IBAN basique
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}/;
    if (!ibanRegex.test(iban.toUpperCase())) {
      throw new BadRequestException('Format IBAN invalide');
    }

    // Format standardisé compatible avec Express
    return {
      success: true,
      data: {
        isValid: true,
        iban: iban.toUpperCase(),
        ownerName: 'Destinataire Externe',
        bankName: 'Banque Partenaire',
        country: iban.substring(0, 2),
      },
    };
  }

  async transferToExternalIban(userId: string, ibanTransferDto: IbanTransferDto) {
    try {
      // 1. Vérifier que le compte source existe et appartient à l'utilisateur
      const fromAccount = await this.accountRepository.findById(new AccountId(ibanTransferDto.sourceAccountId));

      if (!fromAccount) {
        throw new NotFoundException('Compte source non trouvé');
      }

      if (fromAccount.userId.value !== userId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à effectuer ce transfert');
      }

      // 2. Validation IBAN
      const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}/;
      if (!ibanRegex.test(ibanTransferDto.destinationIban.toUpperCase())) {
        throw new BadRequestException('Format IBAN invalide');
      }

      // 3. Créer l'objet Money pour le montant
      const amount = new Money(ibanTransferDto.amount, ibanTransferDto.currency);

      // 4. Vérifier que le compte source a assez de fonds
      if (!fromAccount.hasEnoughBalance(amount)) {
        throw new BadRequestException('Solde insuffisant');
      }

      // 5. Débiter le compte source
      fromAccount.debit(amount);

      // 6. Créer la transaction (transfert externe = pas de toAccountId)
      const transaction = Transaction.create(
        fromAccount.id,
        null, // Pas de compte destination pour un IBAN externe
        amount,
        TransactionType.TRANSFER_IBAN,
        ibanTransferDto.description || `Virement vers ${ibanTransferDto.destinationIban.toUpperCase()}`,
      );

      // 7. Sauvegarder (transaction reste en PENDING pour validation par un conseiller)
      await this.accountRepository.save(fromAccount);
      await this.transactionRepository.save(transaction);

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Virement externe effectué avec succès',
        data: {
          transactionId: transaction.getId().getValue(),
          sourceAccountId: ibanTransferDto.sourceAccountId,
          toAccountId: null,
          destinationIban: ibanTransferDto.destinationIban.toUpperCase(),
          amount: ibanTransferDto.amount,
          currency: ibanTransferDto.currency,
          description: ibanTransferDto.description,
          status: transaction.getStatus(),
          createdAt: transaction.getCreatedAt(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors du virement externe');
    }
  }
}
