import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Response } from 'express';

describe('UrlController', () => {
  let controller: UrlController;
  let mockUrlService: any;

  beforeEach(async () => {
    mockUrlService = {
      createShortUrl: jest.fn(),
      getOriginalUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
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

    controller = module.get<UrlController>(UrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUrl', () => {
    it('should create a short URL and return it', async () => {
      const mockResponse = {
        json: jest.fn(),
      } as unknown as Response;

      mockUrlService.createShortUrl.mockResolvedValue('short123');

      await controller.createUrl('https://example.com', mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith({ shortUrl: 'short123' });
    });

    it('should handle errors gracefully', async () => {
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockUrlService.createShortUrl.mockRejectedValue(new Error('Some error'));

      await controller.createUrl('https://example.com', mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getUrl', () => {
    it('should retrieve the original URL and redirect to it', async () => {
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      mockUrlService.getOriginalUrl.mockResolvedValue('https://example.com');

      await controller.getUrl('short123', mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('should handle errors gracefully', async () => {
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockUrlService.getOriginalUrl.mockRejectedValue(new Error('URL not found'));

      await controller.getUrl('short123', mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Short URL not found' });
    });
  });
});
