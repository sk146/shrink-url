import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlService } from './url.service';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  async createUrl(@Body('url') url: string, @Res() res: Response): Promise<void> {
    try {
      const shortUrl = await this.urlService.createShortUrl(url);
      res.json({ shortUrl });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Get(':shortUrl')
  async getUrl(@Param('shortUrl') shortUrl: string, @Res() res: Response): Promise<void> {
    try {
      const originalUrl = await this.urlService.getOriginalUrl(shortUrl);
      res.redirect(originalUrl);
    } catch (error) {
      res.status(404).json({ error: 'Short URL not found' });
    }
  }
}
