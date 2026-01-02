import { Module } from '@nestjs/common';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { InvestmentOrderRepository } from '@infrastructure/database/postgresql/InvestmentOrderRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';

@Module({
  controllers: [InvestmentsController],
  providers: [
    InvestmentsService,
    InvestmentOrderRepository,
    StockRepository,
    AccountRepository,
  ],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
