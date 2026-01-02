import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('advisor', 'director')
  async createNews(
    @CurrentUser() user: any,
    @Body() createNewsDto: CreateNewsDto,
  ) {
    return this.newsService.createNews(user.userId, createNewsDto);
  }

  @Get()
  async getAllNews(@Query('publishedOnly') publishedOnly?: string) {
    const published = publishedOnly === 'true';
    return this.newsService.getAllNews(published);
  }

  @Get(':id')
  async getNewsById(@Param('id') id: string) {
    return this.newsService.getNewsById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('advisor', 'director')
  async updateNews(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return this.newsService.updateNews(id, user.userId, user.role, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('advisor', 'director')
  async deleteNews(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.newsService.deleteNews(id, user.userId, user.role);
  }
}
