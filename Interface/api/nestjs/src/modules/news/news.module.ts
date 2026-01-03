import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsRepository } from '@infrastructure/database/postgresql/NewsRepository';

@Module({
  controllers: [NewsController],
  providers: [
    NewsService,
    NewsRepository,
  ],
  exports: [NewsService],
})
export class NewsModule {}
