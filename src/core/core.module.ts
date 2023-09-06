import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { loggerProvider } from './logger.provider';

@Module({
    providers: [
        PrismaService,
        RedisService,
        loggerProvider
    ],
    exports: [
        PrismaService,
        RedisService,
        loggerProvider
    ],
})
export class CoreModule {}
