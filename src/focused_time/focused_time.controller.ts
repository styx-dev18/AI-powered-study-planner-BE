import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { FocusedTimeService } from './focused_time.service';
import { AddFocusedTimeDto } from './dto/focused_time.dto';

@Controller('tasks/:taskId/focused-time')
export class FocusedTimeController {
  constructor(private readonly focusedTimeService: FocusedTimeService) {}

  @Post()
  async addFocusedTime(
    @Param('taskId') taskId: string,
    @Body() addFocusedTimeDto: AddFocusedTimeDto,
  ) {
    return this.focusedTimeService.addFocusedTime(taskId, addFocusedTimeDto);
  }

  @Get()
  async getFocusedTimes(@Param('taskId') taskId: string) {
    return this.focusedTimeService.getFocusedTimes(taskId);
  }
}
