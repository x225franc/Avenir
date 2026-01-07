import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Chargement IMPÉRATIF du .env AVANT toute autre opération
// Cela garantit que les variables sont disponibles pour database-postgres.ts
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Test de connexion PostgreSQL
import { testConnection } from '@infrastructure/database/postgresql/connection';

async function bootstrap() {
  // Tester la connexion PostgreSQL avant de démarrer l'application
  console.log('Test de connexion PostgreSQL...');
  const connected = await testConnection();
  if (!connected) {
    console.error('Impossible de démarrer: PostgreSQL non accessible');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Security middleware
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // console.log(`NestJS API running on http://localhost:${port}`);
  // console.log(`Health check: http://localhost:${port}/api/health`);
}

bootstrap();
