import { Module } from '@nestjs/common';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { CreditRepository } from '@infrastructure/database/postgresql/CreditRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';

@Module({
  controllers: [CreditsController],
  providers: [
    CreditsService,
    { provide: CreditRepository, useFactory: () => new CreditRepository() },
    { provide: AccountRepository, useFactory: () => new AccountRepository() },
    { provide: UserRepository, useFactory: () => new UserRepository() },
    { provide: TransactionRepository, useFactory: () => new TransactionRepository() },
  ],
  exports: [CreditsService],
})
export class CreditsModule {}
