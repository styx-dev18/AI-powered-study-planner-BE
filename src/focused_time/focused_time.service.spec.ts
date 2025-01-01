import { Test, TestingModule } from '@nestjs/testing';
import { FocusedTimeService } from './focused_time.service';

describe('FocusedTimeService', () => {
  let service: FocusedTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FocusedTimeService],
    }).compile();

    service = module.get<FocusedTimeService>(FocusedTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
