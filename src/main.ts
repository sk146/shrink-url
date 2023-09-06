import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService); // Отримання екземпляра ConfigService
  const port = configService.get<number>('PORT') || 3000; // Якщо PORT відсутній у файлі .env, використовується значення за замовчуванням 3000

  await app.listen(port);
}

bootstrap();
