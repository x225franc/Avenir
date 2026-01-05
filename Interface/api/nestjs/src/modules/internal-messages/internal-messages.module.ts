import { Module } from '@nestjs/common';
import { InternalMessagesController } from './internal-messages.controller';
import { InternalMessagesService } from './internal-messages.service';
import { InternalMessageRepository } from '@infrastructure/database/postgresql/InternalMessageRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';

@Module({
  controllers: [InternalMessagesController],
  providers: [
    InternalMessagesService,
    {
      provide: InternalMessageRepository,
      useFactory: () => new InternalMessageRepository(),
    },
    {
      provide: UserRepository,
      useFactory: () => new UserRepository(),
    },
  ],
})
export class InternalMessagesModule {}
