import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User]), ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService, TypeOrmModule]
})
export class TaskModule {}
