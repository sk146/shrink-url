import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger, LogLevel } from '@nestjs/common';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;



  const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'logs/app.log' }),
    ],
  });

  const fileTransport = new winston.transports.File({
    filename: '../logs/app.log',
    handleExceptions: true,
  });

  logger.add(fileTransport);

  process.on('SIGINT', async () => {
    logger.debug('Received SIGINT. Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.debug('Received SIGTERM. Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  await app.listen(port);
}

bootstrap();