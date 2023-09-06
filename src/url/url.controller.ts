import { Controller, Get, Post, Body, Param, Res, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlService } from './url.service';
import { Logger } from 'winston';

@Controller()
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    @Inject('Logger') private readonly logger: Logger
    ) {}

  @Post()
  async createUrl(@Body('url') url: string, @Res() res: Response): Promise<void> {
    try {
      const shortUrl = await this.urlService.createShortUrl(url);
      res.json({ shortUrl });
      this.logger.info(`Created short URL for ${url}: ${shortUrl}`);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      this.logger.error(`Failed to create short URL for ${url}: ${error}`);
    }
  }

  @Get(':shortUrl')
  async getUrl(@Param('shortUrl') shortUrl: string, @Res() res: Response): Promise<void> {
    try {
      const originalUrl = await this.urlService.getOriginalUrl(shortUrl);
      res.redirect(originalUrl);
      this.logger.info(`Redirected short URL ${shortUrl} to ${originalUrl}`);
    } catch (error) {
      res.status(404).json({ error: 'Short URL not found' });
      this.logger.error(`Failed to redirect short URL ${shortUrl}: ${error}`);
    }
  }
}
