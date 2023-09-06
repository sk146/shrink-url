import { Module } from '@nestjs/common';

import { CoreModule } from 'src/core/core.module';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { BullModule } from '@nestjs/bull';
import { HitsConsumer } from './hits.consumer';
import { HitsProducer } from './hits.producer';

@Module({
  imports: [
    CoreModule,
    BullModule.registerQueue({
      name: 'hits',
    }),
  ],
  controllers: [UrlController],
  providers: [UrlService, HitsConsumer, HitsProducer],
  exports: [UrlService],
})
export class UrlModule { }
