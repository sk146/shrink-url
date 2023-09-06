import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { PrismaService } from 'src/core/prisma.service';
import { RedisService } from 'src/core/redis.service';
import { ConfigService } from '@nestjs/config';
import { HitsProducer } from './hits.producer';

describe('UrlService', () => {
  let service: UrlService;
  let mockPrismaService: any;
  let mockRedisService: any;
  let mockConfigService: any;
  let mockHitsProducer: any;

  beforeEach(async () => {
    mockPrismaService = {
      url: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    mockRedisService = {
      getClient: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
      }),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    mockHitsProducer = {
      addHit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HitsProducer,
          useValue: mockHitsProducer,
        },
        {
          provide: 'Logger',
          useValue: {
              info: jest.fn(),
              error: jest.fn()
          }
      },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should retrieve the original URL from Redis and return it', async () => {
      const shortUrl = 'abcdefghi';
      const originalUrl = 'https://original-url.com';

      (mockRedisService.getClient().get as jest.Mock).mockResolvedValue(originalUrl);

      const result = await service.getOriginalUrl(shortUrl);
      expect(result).toBe(originalUrl);
      expect(mockHitsProducer.addHit).toHaveBeenCalledWith(shortUrl);
    });

  });

  describe('getOriginalUrl', () => {
    it('should retrieve the original URL from Redis and return it', async () => {
      const shortUrl = 'abcdefghi';
      const originalUrl = 'https://original-url.com';

      mockRedisService.getClient().get.mockResolvedValue(originalUrl);

      const result = await service.getOriginalUrl(shortUrl);
      expect(result).toBe(originalUrl);
      expect(mockHitsProducer.addHit).toHaveBeenCalledWith(shortUrl);
    });

    it('should retrieve the original URL from the database if not in Redis, set it in Redis, and return it', async () => {
      const shortUrl = 'abcdefghi';
      const originalUrl = 'https://original-url.com';

      mockRedisService.getClient().get.mockResolvedValue(null);
      mockPrismaService.url.findUnique.mockResolvedValue({ original_url: originalUrl });

      const result = await service.getOriginalUrl(shortUrl);
      expect(result).toBe(originalUrl);
      expect(mockHitsProducer.addHit).toHaveBeenCalledWith(shortUrl);
    });

    it('should throw an error if the URL is not found', async () => {
      mockRedisService.getClient().get.mockResolvedValue(null);
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.getOriginalUrl('invalidSlug')).rejects.toThrow('Short URL not found');
    });
  });
});
