import { Module } from '@nestjs/common';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { CreditRepository } from '@infrastructure/database/postgresql/CreditRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';

@Module({
  controllers: [CreditsController],
  providers: [
    CreditsService,
    CreditRepository,
    AccountRepository,
  ],
  exports: [CreditsService],
})
export class CreditsModule {}
