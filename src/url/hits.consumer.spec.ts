import { Test, TestingModule } from '@nestjs/testing';
import { HitsConsumer } from './hits.consumer';
import { PrismaService } from 'src/core/prisma.service';
import { Job } from 'bull';

describe('HitsConsumer', () => {
    let hitsConsumer: HitsConsumer;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const mockPrismaService = {
            url: {
                update: jest.fn()
            }
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HitsConsumer,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
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

        hitsConsumer = module.get<HitsConsumer>(HitsConsumer);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(hitsConsumer).toBeDefined();
    });

    describe('handleUpdateHit', () => {
        it('should increment hits for given shortUrl', async () => {
            const mockJob: Partial<Job> = {
                data: {
                    shortUrl: 'testShortUrl'
                }
            };

            await hitsConsumer.handleUpdateHit(mockJob as Job);

            expect(prismaService.url.update).toHaveBeenCalledWith({
                where: { short_url: 'testShortUrl' },
                data: { hits: { increment: 1 } }
            });
        });
    });
});
