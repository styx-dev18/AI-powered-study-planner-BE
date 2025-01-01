import { Module } from '@nestjs/common';
import { FocusedTimeService } from './focused_time.service';
import { FocusedTimeController } from './focused_time.controller';
import { FocusedTime } from 'src/entities/focused-time.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from 'src/task/task.module';
import { Task } from 'src/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FocusedTime, Task]), TaskModule],
  providers: [FocusedTimeService],
  controllers: [FocusedTimeController]
})
export class FocusedTimeModule { }
