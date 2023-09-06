import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { UrlModule } from './url/url.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Якщо ви хочете використовувати конфігурацію глобально
      envFilePath: '.env', // Шлях до вашого .env файлу
      // Опційно, якщо хочете перевіряти наявність змінних середовища:
      // validationSchema: Joi.object({
      //   DATABASE_URL: Joi.string().required(),
      //   SECRET: Joi.string().required(),
      //   // ... інші змінні
      // }),
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    UrlModule,
    CoreModule
  ],
})
export class AppModule {}
