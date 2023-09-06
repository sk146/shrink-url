import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class HitsProducer {
  constructor(@InjectQueue('hits') private hitsQueue: Queue) {}

  async addHit(shortUrl: string) {
    await this.hitsQueue.add('update-hit', { shortUrl });
  }
}
