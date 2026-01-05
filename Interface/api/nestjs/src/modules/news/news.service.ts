import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsRepository } from '@infrastructure/database/postgresql/NewsRepository';
import { CreateNews } from '@application/use-cases/news/CreateNews';
import { GetNews } from '@application/use-cases/news/GetNews';
import { UpdateNews } from '@application/use-cases/news/UpdateNews';
import { DeleteNews } from '@application/use-cases/news/DeleteNews';

@Injectable()
export class NewsService {
  constructor(
    private readonly newsRepository: NewsRepository,
  ) {}

  async createNews(authorId: string, createNewsDto: CreateNewsDto) {
    try {
      // Utiliser le Use Case CreateNews
      const createNewsUseCase = new CreateNews(this.newsRepository);

      const result = await createNewsUseCase.execute({
        title: createNewsDto.title,
        content: createNewsDto.content,
        authorId,
        published: createNewsDto.published,
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors de la création de l actualité');
      }

      return {
        id: result.news!.id,
        title: result.news!.title,
        content: result.news!.content,
        authorId: result.news!.authorId.value,
        published: result.news!.published,
        createdAt: result.news!.createdAt,
        updatedAt: result.news!.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création de l actualité');
    }
  }

  async getAllNews(publishedOnly: boolean = false) {
    try {
      // Utiliser le Use Case GetNews
      const getNewsUseCase = new GetNews(this.newsRepository);

      const result = await getNewsUseCase.execute(publishedOnly);

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors de la récupération des actualités');
      }

      return result.news!.map(news => ({
        id: news.id,
        title: news.title,
        content: news.content,
        authorId: news.authorId.value,
        published: news.published,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
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
      // Vérifier les permissions d'abord
      const news = await this.newsRepository.findById(id);

      if (!news) {
        throw new NotFoundException('Actualité non trouvée');
      }

      if (news.authorId.value !== userId && userRole !== 'director') {
        throw new ForbiddenException('Vous n êtes pas autorisé à modifier cette actualité');
      }

      // Utiliser le Use Case UpdateNews
      const updateNewsUseCase = new UpdateNews(this.newsRepository);

      const result = await updateNewsUseCase.execute({
        id,
        title: updateNewsDto.title ?? news.title,
        content: updateNewsDto.content ?? news.content,
        published: updateNewsDto.published,
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors de la mise à jour de l actualité');
      }

      return {
        id: result.news!.id,
        title: result.news!.title,
        content: result.news!.content,
        authorId: result.news!.authorId.value,
        published: result.news!.published,
        createdAt: result.news!.createdAt,
        updatedAt: result.news!.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la mise à jour de l actualité');
    }
  }

  async deleteNews(id: string, userId: string, userRole: string) {
    try {
      // Vérifier les permissions d'abord
      const news = await this.newsRepository.findById(id);

      if (!news) {
        throw new NotFoundException('Actualité non trouvée');
      }

      if (news.authorId.value !== userId && userRole !== 'director') {
        throw new ForbiddenException('Vous n êtes pas autorisé à supprimer cette actualité');
      }

      // Utiliser le Use Case DeleteNews
      const deleteNewsUseCase = new DeleteNews(this.newsRepository);

      const result = await deleteNewsUseCase.execute(id);

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors de la suppression de l actualité');
      }

      return {
        message: 'Actualité supprimée avec succès',
        id,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la suppression de l actualité');
    }
  }
}
