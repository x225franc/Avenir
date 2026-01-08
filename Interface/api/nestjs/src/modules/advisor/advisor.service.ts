import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserId } from '@domain/value-objects/UserId';
import { TransactionId } from '@domain/value-objects/TransactionId';
import { TransactionStatus } from '@domain/enums/TransactionStatus';

@Injectable()
export class AdvisorService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async getAllAdvisors() {
    try {
      const allUsers = await this.userRepository.findAll();
      const advisors = allUsers.filter(user => user.role === 'advisor' || user.role === 'director');

      return advisors.map(advisor => ({
        id: advisor.id.value,
        email: advisor.email.value,
        firstName: advisor.firstName,
        lastName: advisor.lastName,
        role: advisor.role,
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des conseillers');
    }
  }

  async getAdvisorClients(advisorId: string) {
    try {
      const allUsers = await this.userRepository.findAll();
      const clients = allUsers.filter(user => user.role === 'client');

      return clients.map(client => ({
        id: client.id.value,
        email: client.email.value,
        firstName: client.firstName,
        lastName: client.lastName,
        role: client.role,
        createdAt: client.createdAt,
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des clients');
    }
  }

  async getAdvisorTransactions(advisorId: string) {
    try {
      const allTransactions = await this.transactionRepository.findAll();

      return allTransactions.map(transaction => ({
        id: transaction.getId().getValue(),
        fromAccountId: transaction.getFromAccountId()?.value || null,
        toAccountId: transaction.getToAccountId()?.value || null,
        amount: transaction.getAmount().amount,
        type: transaction.getType(),
        status: transaction.getStatus(),
        description: transaction.getDescription(),
        createdAt: transaction.getCreatedAt(),
        updatedAt: transaction.getUpdatedAt(),
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des transactions');
    }
  }

  async getPendingTransactions(advisorId: string) {
    try {
      const pendingTransactions = await this.transactionRepository.findByStatus('PENDING');

      const transactionsData = [];
      
      for (const transaction of pendingTransactions) {
        let sourceAccount: any = undefined;
        let destinationAccount: any = undefined;

        const fromId = transaction.getFromAccountId()?.value;
        const toId = transaction.getToAccountId()?.value;

        // Récupérer les infos du compte source
        if (fromId) {
          const acc = await this.accountRepository.findById(transaction.getFromAccountId()!);
          if (acc) {
            const user = await this.userRepository.findById(acc.userId);
            sourceAccount = {
              id: acc.id.value,
              accountNumber: acc.id.value,
              iban: acc.iban.formatted,
              accountType: acc.accountType,
              user: user ? {
                id: user.id.value,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email.value,
              } : undefined,
            };
          }
        }

        // Récupérer les infos du compte destination (si ce n'est pas un transfert externe)
        if (toId) {
          const acc = await this.accountRepository.findById(transaction.getToAccountId()!);
          if (acc) {
            const user = await this.userRepository.findById(acc.userId);
            destinationAccount = {
              id: acc.id.value,
              accountNumber: acc.id.value,
              iban: acc.iban.formatted,
              accountType: acc.accountType,
              user: user ? {
                id: user.id.value,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email.value,
              } : undefined,
            };
          }
        }

        transactionsData.push({
          id: transaction.getId().getValue(),
          fromAccountId: fromId,
          toAccountId: toId,
          amount: transaction.getAmount().amount,
          currency: transaction.getAmount().currency,
          type: transaction.getType(),
          status: transaction.getStatus(),
          description: transaction.getDescription(),
          createdAt: transaction.getCreatedAt(),
          sourceAccount,
          destinationAccount,
        });
      }

      return {
        success: true,
        data: transactionsData,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des transactions en attente');
    }
  }

  async approveTransaction(advisorId: string, transactionId: string) {
    try {
      const transactionIdVO = TransactionId.create(transactionId);
      const transaction = await this.transactionRepository.findById(transactionIdVO);

      if (!transaction) {
        throw new NotFoundException('Transaction non trouvée');
      }

      if (!transaction.isPending()) {
        throw new BadRequestException('Seules les transactions en attente peuvent être approuvées');
      }

      // Approve transaction
      transaction.approve();
      await this.transactionRepository.update(transaction);

      return {
        success: true,
        message: 'Transaction approuvée avec succès',
        data: {
          transactionId: transaction.getId().getValue(),
          status: transaction.getStatus(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l approbation de la transaction');
    }
  }

  async rejectTransaction(advisorId: string, transactionId: string) {
    try {
      const transactionIdVO = TransactionId.create(transactionId);
      const transaction = await this.transactionRepository.findById(transactionIdVO);

      if (!transaction) {
        throw new NotFoundException('Transaction non trouvée');
      }

      if (!transaction.isPending()) {
        throw new BadRequestException('Seules les transactions en attente peuvent être rejetées');
      }

      // If there was a debit from source account, refund it BEFORE rejecting
      const fromAccountId = transaction.getFromAccountId();
      if (fromAccountId) {
        const fromAccount = await this.accountRepository.findById(fromAccountId);
        if (fromAccount) {
          fromAccount.credit(transaction.getAmount());
          await this.accountRepository.save(fromAccount);
        }
      }

      // Reject transaction
      transaction.reject();
      await this.transactionRepository.update(transaction);

      return {
        success: true,
        message: 'Transaction rejetée avec succès',
        data: {
          transactionId: transaction.getId().getValue(),
          status: transaction.getStatus(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors du rejet de la transaction');
    }
  }

  async notifyClient(advisorId: string, clientId: string, subject: string, message: string) {
    try {
      const clientIdVO = UserId.fromString(clientId);
      const client = await this.userRepository.findById(clientIdVO);

      if (!client) {
        throw new NotFoundException('Client non trouvé');
      }

      // TODO: Implement notification system (email, in-app notification, etc.)
      // For now, just return success

      return {
        message: 'Notification envoyée avec succès',
        clientId,
        subject,
        notificationMessage: message,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l envoi de la notification');
    }
  }
}
