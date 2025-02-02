import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    async createTask(@Body() createTaskDto: CreateTaskDto) {
        return await this.taskService.createTask(createTaskDto);
    }
    
    @Get()
    async getTasksByUser(@Query('userId') userId: string) {
        return await this.taskService.getTasksByUser(userId);
    }

    @Get(':id')
    async getTaskById(@Param('id') id: string) {
        return await this.taskService.getTaskById(id);
    }

    @Put(':id')
    async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return await this.taskService.updateTask(id, updateTaskDto);
    }

    @Delete(':id')
    async deleteTask(@Param('id') id: string) {
        return await this.taskService.deleteTask(id);
    }

    @Get('status-count/:userId')
    async getTaskStatusCount(@Param('userId') userId: string) {
        return await this.taskService.getTaskStatusCount(userId);
    }
    @Get('focused-time-count/:userId')
    async getTaskFocusedTimeByDate(@Param('userId') userId: string) {
        return await this.taskService.getTaskFocusedTimeByDate(userId);
    }

    @Get('focused-time-count-7-days/:userId')
    async getTaskFocusedTime7days(@Param('userId') userId: string) {
        return await this.taskService.getTaskFocusedTime7days(userId);
    }
}
