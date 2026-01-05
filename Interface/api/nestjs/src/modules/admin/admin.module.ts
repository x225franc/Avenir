import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { BankSettingsRepository } from '@infrastructure/database/postgresql/BankSettingsRepository';
import { InvestmentOrderRepository } from '@infrastructure/database/postgresql/InvestmentOrderRepository';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: UserRepository, useFactory: () => new UserRepository() },
    { provide: StockRepository, useFactory: () => new StockRepository() },
    { provide: AccountRepository, useFactory: () => new AccountRepository() },
    { provide: TransactionRepository, useFactory: () => new TransactionRepository() },
    { provide: BankSettingsRepository, useFactory: () => new BankSettingsRepository() },
    { provide: InvestmentOrderRepository, useFactory: () => new InvestmentOrderRepository() },
  ],
  exports: [AdminService],
})
export class AdminModule {}
