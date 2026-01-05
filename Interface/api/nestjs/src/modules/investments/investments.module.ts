import { Module } from '@nestjs/common';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { InvestmentOrderRepository } from '@infrastructure/database/postgresql/InvestmentOrderRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { BankSettingsRepository } from '@infrastructure/database/postgresql/BankSettingsRepository';

@Module({
  controllers: [InvestmentsController],
  providers: [
    InvestmentsService,
    { provide: InvestmentOrderRepository, useFactory: () => new InvestmentOrderRepository() },
    { provide: StockRepository, useFactory: () => new StockRepository() },
    { provide: AccountRepository, useFactory: () => new AccountRepository() },
    { provide: TransactionRepository, useFactory: () => new TransactionRepository() },
    { provide: BankSettingsRepository, useFactory: () => new BankSettingsRepository() },
  ],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
