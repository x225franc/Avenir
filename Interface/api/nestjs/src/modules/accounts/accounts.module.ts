import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';

@Module({
  controllers: [AccountsController],
  providers: [
    AccountsService,
    { provide: AccountRepository, useFactory: () => new AccountRepository() },
    { provide: UserRepository, useFactory: () => new UserRepository() },
  ],
  exports: [AccountsService],
})
export class AccountsModule {}
