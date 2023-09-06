import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {Redis} from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      port: 6379,
      host: '127.0.0.1',
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
