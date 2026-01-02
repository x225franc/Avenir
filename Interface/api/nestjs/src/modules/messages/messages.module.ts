import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageRepository } from '@infrastructure/database/postgresql/MessageRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, MessageRepository, UserRepository],
  exports: [MessagesService],
})
export class MessagesModule {}
