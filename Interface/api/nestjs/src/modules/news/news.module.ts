import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsRepository } from '@infrastructure/database/postgresql/NewsRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';

@Module({
  controllers: [NewsController],
  providers: [
    NewsService,
    NewsRepository,
    UserRepository,
  ],
  exports: [NewsService],
})
export class NewsModule {}
