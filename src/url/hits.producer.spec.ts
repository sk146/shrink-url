import { Test, TestingModule } from '@nestjs/testing';
import { HitsProducer } from './hits.producer';
import { Queue } from 'bull';
import { BullModule, InjectQueue } from '@nestjs/bull';

describe('HitsProducer', () => {
  let hitsProducer: HitsProducer;
  let mockHitsQueue: Partial<Queue>;

  beforeEach(async () => {
    mockHitsQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({ name: 'hits' })
      ],
      providers: [
        HitsProducer,
        {
          provide: 'BullQueue_hits',
          useValue: mockHitsQueue,
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

    hitsProducer = module.get<HitsProducer>(HitsProducer);
  });

  it('should be defined', () => {
    expect(hitsProducer).toBeDefined();
  });

  describe('addHit', () => {
    it('should add a hit to the queue', async () => {
      const shortUrl = 'testShortUrl';
      await hitsProducer.addHit(shortUrl);

      expect(mockHitsQueue.add).toHaveBeenCalledWith('update-hit', { shortUrl });
    });
  });
});
