import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): string {
    return 'Avenir Bank API (NestJS) - PostgreSQL';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'postgresql',
      framework: 'nestjs',
    };
  }
}
