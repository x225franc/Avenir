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
      await depositUseCase.execute({
        accountId: depositDto.accountId,
        amount: depositDto.amount,
      });

      // Récupérer le compte mis à jour
      const updatedAccount = await this.accountRepository.findById(accountIdVO);

      return {
        message: 'Dépôt effectué avec succès',
        account: {
          id: updatedAccount!.id.value,
          accountName: updatedAccount!.accountName,
          balance: updatedAccount!.balance.amount,
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
      await withdrawUseCase.execute({
        accountId: withdrawDto.accountId,
        amount: withdrawDto.amount,
      });

      // Récupérer le compte mis à jour
      const updatedAccount = await this.accountRepository.findById(accountIdVO);

      return {
        message: 'Retrait effectué avec succès',
        account: {
          id: updatedAccount!.id.value,
          accountName: updatedAccount!.accountName,
          balance: updatedAccount!.balance.amount,
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
