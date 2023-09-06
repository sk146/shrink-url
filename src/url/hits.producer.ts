import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from 'winston';

@Injectable()
export class HitsProducer {
  constructor(
    @InjectQueue('hits') private hitsQueue: Queue,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async addHit(shortUrl: string) {
    await this.hitsQueue.add('update-hit', { shortUrl });

    this.logger.info(`Added hit for ${shortUrl}`);
  }
}