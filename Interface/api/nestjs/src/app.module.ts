import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { MessagesModule } from './modules/messages/messages.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { CreditsModule } from './modules/credits/credits.module';
import { NewsModule } from './modules/news/news.module';
import { AdminModule } from './modules/admin/admin.module';
import { AdvisorModule } from './modules/advisor/advisor.module';
import { OperationsModule } from './modules/operations/operations.module';
import { InternalMessagesModule } from './modules/internal-messages/internal-messages.module';
import { GatewaysModule } from './gateways/gateways.module';
import { SseController } from './controllers/sse.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Utilise le .env local du dossier nestjs
    }),
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    MessagesModule,
    InvestmentsModule,
    CreditsModule,
    NewsModule,
    AdminModule,
    AdvisorModule,
    OperationsModule,
    InternalMessagesModule,
    GatewaysModule,
  ],
  controllers: [AppController, SseController],
  providers: [AppService],
})
export class AppModule {}
