import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, AccountRepository, TransactionRepository],
  exports: [TransactionsService],
})
export class TransactionsModule {}
