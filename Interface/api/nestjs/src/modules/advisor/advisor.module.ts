import { Module } from '@nestjs/common';
import { AdvisorController } from './advisor.controller';
import { AdvisorService } from './advisor.service';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';

@Module({
  controllers: [AdvisorController],
  providers: [
    AdvisorService,
    UserRepository,
    TransactionRepository,
    AccountRepository,
  ],
  exports: [AdvisorService],
})
export class AdvisorModule {}
