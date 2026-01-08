import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';

@Module({
  controllers: [OperationsController],
  providers: [
    OperationsService,
    {
      provide: AccountRepository,
      useFactory: () => new AccountRepository(),
    },
    {
      provide: TransactionRepository,
      useFactory: () => new TransactionRepository(),
    },
  ],
})
export class OperationsModule {}
