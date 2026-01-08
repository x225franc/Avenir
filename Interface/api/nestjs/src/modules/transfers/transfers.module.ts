import { Module } from '@nestjs/common';
import { TransfersController } from './transfers.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [TransfersController],
})
export class TransfersModule {}
