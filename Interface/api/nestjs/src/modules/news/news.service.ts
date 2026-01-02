import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsRepository } from '@infrastructure/database/postgresql/NewsRepository';
import { UserId } from '@domain/value-objects/UserId';
import { News } from '@domain/entities/News';

@Injectable()
export class NewsService {
  constructor(
    private readonly newsRepository: NewsRepository,
  ) {}

  async createNews(authorId: string, createNewsDto: CreateNewsDto) {
    try {
      const authorIdVO = UserId.fromString(authorId);

      // Create news entity using static factory
      const news = News.create(
        createNewsDto.title,
        createNewsDto.content,
        authorIdVO,
        createNewsDto.published ?? false
      );

      // Save to database
      const savedNews = await this.newsRepository.create(news);

      return {
        id: savedNews.id,
        title: savedNews.title,
        content: savedNews.content,
        authorId: savedNews.authorId.value,
        published: savedNews.published,
        createdAt: savedNews.createdAt,
        updatedAt: savedNews.updatedAt,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création de l actualité');
    }
  }

  async getAllNews(publishedOnly: boolean = false) {
    try {
      const newsList = publishedOnly
        ? await this.newsRepository.findPublished()
        : await this.newsRepository.findAll();

      return newsList.map(news => ({
        id: news.id,
        title: news.title,
        content: news.content,
        authorId: news.authorId.value,
        published: news.published,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des actualités');
    }
  }

  async getNewsById(id: string) {
    try {
      const news = await this.newsRepository.findById(id);

      if (!news) {
        throw new NotFoundException('Actualité non trouvée');
      }

      return {
        id: news.id,
        title: news.title,
        content: news.content,
        authorId: news.authorId.value,
        published: news.published,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération de l actualité');
    }
  }

  async updateNews(id: string, userId: string, userRole: string, updateNewsDto: UpdateNewsDto) {
    try {
      const news = await this.newsRepository.findById(id);

      if (!news) {
        throw new NotFoundException('Actualité non trouvée');
      }

      // Only author or director can update
      if (news.authorId.value !== userId && userRole !== 'director') {
        throw new ForbiddenException('Vous n êtes pas autorisé à modifier cette actualité');
      }

      // Use immutable update pattern from News entity
      let updatedNews = news;

      // Update title and content if provided
      if (updateNewsDto.title || updateNewsDto.content) {
        updatedNews = updatedNews.update(
          updateNewsDto.title ?? updatedNews.title,
          updateNewsDto.content ?? updatedNews.content
        );
      }

      // Update published status if provided
      if (updateNewsDto.published !== undefined) {
        if (updateNewsDto.published && !updatedNews.published) {
          updatedNews = updatedNews.publish();
        } else if (!updateNewsDto.published && updatedNews.published) {
          updatedNews = updatedNews.unpublish();
        }
      }

      // Save to database
      const savedNews = await this.newsRepository.update(updatedNews);

      return {
        id: savedNews.id,
        title: savedNews.title,
        content: savedNews.content,
        authorId: savedNews.authorId.value,
        published: savedNews.published,
        createdAt: savedNews.createdAt,
        updatedAt: savedNews.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la mise à jour de l actualité');
    }
  }

  async deleteNews(id: string, userId: string, userRole: string) {
    try {
      const news = await this.newsRepository.findById(id);

      if (!news) {
        throw new NotFoundException('Actualité non trouvée');
      }

      // Only author or director can delete
      if (news.authorId.value !== userId && userRole !== 'director') {
        throw new ForbiddenException('Vous n êtes pas autorisé à supprimer cette actualité');
      }

      await this.newsRepository.delete(id);

      return {
        message: 'Actualité supprimée avec succès',
        id,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la suppression de l actualité');
    }
  }
}
