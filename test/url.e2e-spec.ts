import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { UrlService } from '../src/url/url.service';

describe('UrlController (e2e)', () => {
  let app: INestApplication;

  const mockUrlService = {
    createShortUrl: jest.fn(),
    getOriginalUrl: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(UrlService)
    .useValue(mockUrlService)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (POST) - create short URL', () => {
    const mockUrl = 'http://example.com';
    const mockShortUrl = 'shortUrl123';

    mockUrlService.createShortUrl.mockResolvedValue(mockShortUrl);

    return request(app.getHttpServer())
      .post('/')
      .send({ url: mockUrl })
      .expect(201)
      .expect({ shortUrl: mockShortUrl });
  });

  it('/:shortUrl (GET) - redirect to original URL', () => {
    const mockShortUrl = 'shortUrl123';
    const mockOriginalUrl = 'http://example.com';

    mockUrlService.getOriginalUrl.mockResolvedValue(mockOriginalUrl);

    return request(app.getHttpServer())
      .get(`/${mockShortUrl}`)
      .expect(302)
      .expect('Location', mockOriginalUrl);
  });

  it('/:shortUrl (GET) - error for non-existent short URL', () => {
    const mockShortUrl = 'shortUrlNotExists';

    mockUrlService.getOriginalUrl.mockRejectedValue(new Error('Short URL not found'));

    return request(app.getHttpServer())
      .get(`/${mockShortUrl}`)
      .expect(404)
      .expect({ error: 'Short URL not found' });
  });
});
