import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { BankSettingsRepository } from '@infrastructure/database/postgresql/BankSettingsRepository';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    UserRepository,
    StockRepository,
    AccountRepository,
    BankSettingsRepository,
  ],
  exports: [AdminService],
})
export class AdminModule {}
