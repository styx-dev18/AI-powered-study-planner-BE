import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { User } from '../entities/user.entity'

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createTask(createTaskDto: CreateTaskDto): Promise<{ message: string; statusCode: number; data: Task }> {
        const { userId, ...taskData } = createTaskDto;
        const task = this.taskRepository.create({ createdBy: userId, ...taskData });
        const createdTask = await this.taskRepository.save(task);

        return {
            message: "Task created successfully.",
            statusCode: 200,
            data: createdTask
        }
    }

    async getTaskById(id: string): Promise<{ message: string, data: Task }> {
        const task = await this.taskRepository.findOne({ where: { id } });
        if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

        return {
            message: "Retrieve task successfully.",
            data: task,
        };
    }

    async getTasksByUser(userId: string): Promise<{ message: string; statusCode: number; data: Task[] }> {
        if (!userId) {
            throw new NotFoundException(`User not found`);
        }
        const user = await this.userRepository.findOne({ where: { userId: userId } });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        const tasks = await this.taskRepository.find({ where: { createdBy: userId } });

        return {
            message: "Retrieve user's tasks successfully",
            statusCode: 200,
            data: tasks
        };
    }

    async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<{ message: string; statusCode: number; data: Task }> {
        const response = await this.getTaskById(id);
        const task = response.data;
        Object.assign(task, updateTaskDto);
        const updatedTask = await this.taskRepository.save(task);

        return {
            message: `Task updated successfully`,
            statusCode: 200,
            data: updatedTask,
        };
    }

    async deleteTask(id: string): Promise<{ message: string, statusCode: number }> {
        const result = await this.taskRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Task with ID ${id} not found`);

        return {
            message: `Task with ID ${id} deleted successfully`,
            statusCode: 200,
        };
    }
}
