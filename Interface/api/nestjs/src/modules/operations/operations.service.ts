import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { DepositMoney } from '@application/use-cases/account/DepositMoney';
import { WithdrawMoney } from '@application/use-cases/account/WithdrawMoney';
import { AccountId } from '@domain/value-objects/AccountId';
import { UserId } from '@domain/value-objects/UserId';

@Injectable()
export class OperationsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async deposit(userId: string, depositDto: DepositDto) {
    try {
      // Vérifier que l'utilisateur est propriétaire du compte
      const accountIdVO = new AccountId(depositDto.accountId);
      const account = await this.accountRepository.findById(accountIdVO);

      if (!account) {
        throw new NotFoundException('Compte non trouvé');
      }

      if (account.userId.value !== userId) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à effectuer cette opération');
      }

      // Utiliser le Use Case
      const depositUseCase = new DepositMoney(this.accountRepository, this.transactionRepository);
      const transaction = await depositUseCase.execute({
        accountId: depositDto.accountId,
        amount: depositDto.amount,
        description: depositDto.description,
      });

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Dépôt effectué avec succès',
        data: {
          transactionId: transaction.getId().getValue(),
          fromAccountId: transaction.getFromAccountId()?.value || null,
          toAccountId: transaction.getToAccountId()?.value || null,
          amount: transaction.getAmount().amount,
          currency: transaction.getAmount().currency,
          type: transaction.getType(),
          status: transaction.getStatus(),
          description: transaction.getDescription(),
          createdAt: transaction.getCreatedAt(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors du dépôt');
    }
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    try {
      // Vérifier que l'utilisateur est propriétaire du compte
      const accountIdVO = new AccountId(withdrawDto.accountId);
      const account = await this.accountRepository.findById(accountIdVO);

      if (!account) {
        throw new NotFoundException('Compte non trouvé');
      }

      if (account.userId.value !== userId) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à effectuer cette opération');
      }

      // Utiliser le Use Case
      const withdrawUseCase = new WithdrawMoney(this.accountRepository, this.transactionRepository);
      const transaction = await withdrawUseCase.execute({
        accountId: withdrawDto.accountId,
        amount: withdrawDto.amount,
        description: withdrawDto.description,
      });

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Retrait effectué avec succès',
        data: {
          transactionId: transaction.getId().getValue(),
          fromAccountId: transaction.getFromAccountId()?.value || null,
          toAccountId: transaction.getToAccountId()?.value || null,
          amount: transaction.getAmount().amount,
          currency: transaction.getAmount().currency,
          type: transaction.getType(),
          status: transaction.getStatus(),
          description: transaction.getDescription(),
          createdAt: transaction.getCreatedAt(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors du retrait');
    }
  }
}
