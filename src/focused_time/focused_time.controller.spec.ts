import { Test, TestingModule } from '@nestjs/testing';
import { FocusedTimeController } from './focused_time.controller';

describe('FocusedTimeController', () => {
  let controller: FocusedTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FocusedTimeController],
    }).compile();

    controller = module.get<FocusedTimeController>(FocusedTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
