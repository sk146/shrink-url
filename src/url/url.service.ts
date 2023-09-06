import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from 'src/core/prisma.service';
import { RedisService } from 'src/core/redis.service';
import { HitsProducer } from './hits.producer';

@Injectable()
export class UrlService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
        private readonly hitsProducer: HitsProducer,
    ) {}

    async createShortUrl(originalUrl: string): Promise<string> {
        const shortUrl = await this.createUniqueSlug(originalUrl);

        await this.prisma.url.create({
            data: {
                original_url: originalUrl,
                short_url: shortUrl,
            },
        });

        await this.redisService.getClient().set(shortUrl, originalUrl);

        return `${this.configService.get<string>('BASE_URL')}/${shortUrl}`;
    }

    async getOriginalUrl(shortUrl: string): Promise<string> {
        let originalUrl: string | null = await this.redisService.getClient().get(shortUrl);

        if (!originalUrl) {
            const url = await this.prisma.url.findUnique({
                where: { short_url: shortUrl },
                select: { original_url: true }
            });

            if (!url || !url.original_url) {
                throw new Error('Short URL not found');
            }

            originalUrl = url.original_url;
            await this.redisService.getClient().set(shortUrl, originalUrl);
        }

        this.hitsProducer.addHit(shortUrl);
        return originalUrl;
    }

    private async createUniqueSlug(originalUrl: string): Promise<string> {
        const hash = createHash('sha256').update(originalUrl).digest('hex');
        let slug = hash.substring(0, 9);

        while (await this.slugExists(slug)) {
            const randomString = Math.random().toString(36).substring(2, 6);
            slug = hash.substring(0, 5) + randomString;
        }

        return slug;
    }

    private async slugExists(slug: string): Promise<boolean> {
        const slugRecord = await this.prisma.url.findUnique({
            where: {
                short_url: slug,
            },
        });

        return !!slugRecord;
    }
}
