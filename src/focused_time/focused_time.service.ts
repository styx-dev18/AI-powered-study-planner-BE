import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FocusedTime } from '../entities/focused-time.entity';
import { Task } from '../entities/task.entity';
import { AddFocusedTimeDto } from './dto/focused_time.dto';

@Injectable()
export class FocusedTimeService {
  constructor(
    @InjectRepository(FocusedTime)
    private readonly focusedTimeRepository: Repository<FocusedTime>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async addFocusedTime(taskId: string, addFocusedTimeDto: AddFocusedTimeDto): Promise<FocusedTime> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    const focusedTime = this.focusedTimeRepository.create({
      taskId,
      timeInSeconds: addFocusedTimeDto.timeInSeconds,
    });

    return await this.focusedTimeRepository.save(focusedTime);
  }

  async getFocusedTimes(taskId: string): Promise<FocusedTime[]> {
    return await this.focusedTimeRepository.find({
      where: { taskId: taskId } ,
      relations: ['task'],
    });
  }
}
