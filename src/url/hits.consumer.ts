import { Inject, Injectable } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from 'src/core/prisma.service'; 
import { Logger } from 'winston';

@Injectable()
@Processor('hits')
export class HitsConsumer {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @Process('update-hit')
  async handleUpdateHit(job: Job) {
    const shortUrl = job.data.shortUrl;

    await this.prisma.url.update({
      where: { short_url: shortUrl },
      data: { hits: { increment: 1 } },
    });

    this.logger.info(`Updated hit count for ${shortUrl}`);
  }
}