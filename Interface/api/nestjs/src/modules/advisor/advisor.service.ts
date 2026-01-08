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
      const pendingTransactions = await this.transactionRepository.findByStatus(TransactionStatus.PENDING);

      return pendingTransactions.map(transaction => ({
        id: transaction.getId().getValue(),
        fromAccountId: transaction.getFromAccountId()?.value || null,
        toAccountId: transaction.getToAccountId()?.value || null,
        amount: transaction.getAmount().amount,
        type: transaction.getType(),
        status: transaction.getStatus(),
        description: transaction.getDescription(),
        createdAt: transaction.getCreatedAt(),
      }));
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
        message: 'Transaction approuvée avec succès',
        transactionId: transaction.getId().getValue(),
        status: transaction.getStatus(),
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

      // Reject transaction
      transaction.reject();
      await this.transactionRepository.update(transaction);

      // If there was a debit from source account, refund it
      if (transaction.getFromAccountId()) {
        const fromAccount = await this.accountRepository.findById(transaction.getFromAccountId()!);
        if (fromAccount) {
          fromAccount.credit(transaction.getAmount());
          await this.accountRepository.save(fromAccount);
        }
      }

      return {
        message: 'Transaction rejetée avec succès',
        transactionId: transaction.getId().getValue(),
        status: transaction.getStatus(),
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
