import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { FocusedTime } from '../entities/focused-time.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { User } from '../entities/user.entity'
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(FocusedTime)
        private readonly focusedTimeRepository: Repository<FocusedTime>,
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

    async getTaskStatusCount(userId: string): Promise<{ 
        message: string; 
        statusCode: number; 
        data: {
            Todo: number;
            'In Progress': number;
            Completed: number;
            Expired: number;
        }
    }> {
        const tasks = await this.taskRepository
            .createQueryBuilder('task')
            .select('task.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('task.createdBy = :userId', { userId })
            .groupBy('task.status')
            .getRawMany();
        const statusCounts = {
            'Todo': 0,
            'In Progress': 0,
            'Completed': 0,
            'Expired': 0
        };

        // Update counts from query results
        tasks.forEach(task => {
            console.log(task);
            statusCounts[task.status] = parseInt(task.count);
        });

        return {
            message: "Task status counts retrieved successfully",
            statusCode: 200,
            data: statusCounts
        };
    }

    async getTaskFocusedTimeByDate(userId: string): Promise<{
        message: string;
        statusCode: number;
        data: {
            date: string;
            totalSeconds: number;
        }[];
    }> {
        const userTasks = await this.taskRepository.find({
            where: { createdBy: userId }
        });

        const taskIds = userTasks.map(task => task.id);

        const focusedTimeRecords = await this.focusedTimeRepository
            .createQueryBuilder('focused_time')
            .select('DATE(focused_time.recordedAt)', 'date')
            .addSelect('focused_time.taskId', 'taskId')
            .addSelect('SUM(focused_time.timeInSeconds)', 'totalSeconds')
            .where('focused_time.taskId IN (:...taskIds)', { taskIds })
            .groupBy('DATE(focused_time.recordedAt)')
            .addGroupBy('focused_time.taskId')
            .orderBy('date', 'DESC')
            .getRawMany();

        // Create a map of taskId to task name
        const taskMap = new Map(userTasks.map(task => [task.id, task.name]));

        // Process and format the data
        const dateMap = new Map();
        
        focusedTimeRecords.forEach(record => {
            const date = record.date.toISOString().split('T')[0];
            
            if (!dateMap.has(date)) {
                dateMap.set(date, {
                    date,
                    totalSeconds: 0,
                });
            }

            const dateEntry = dateMap.get(date);
            const timeInSeconds = parseInt(record.totalSeconds);
            
            dateEntry.totalSeconds += timeInSeconds;
        });

        return {
            message: "Focused time records retrieved successfully",
            statusCode: 200,
            data: Array.from(dateMap.values())
        };
    }

    async getTaskFocusedTime7days(userId: string): Promise<{
        message: string;
        statusCode: number;
        data: {
            total_focused_time_in_7_days: number;
            total_estimated_time_in_7_days: number;
        };
    }> {
        // Get date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Get all tasks for the user
        const userTasks = await this.taskRepository.find({
            where: { 
                createdBy: userId,
                created_at: MoreThanOrEqual(sevenDaysAgo)
            }
        });

        const taskIds = userTasks.map(task => task.id);

        // Calculate total estimated time for tasks created in last 7 days
        const total_estimated_time_in_7_days = userTasks.reduce((sum, task) => {
            return sum + (task.estimated_time || 0);
        }, 0);

        // Get focused time records for last 7 days
        const focusedTimeRecords = await this.focusedTimeRepository
            .createQueryBuilder('focused_time')
            .select('DATE(focused_time.recordedAt)', 'date')
            .addSelect('SUM(focused_time.timeInSeconds)', 'focused_time')
            .where('focused_time.taskId IN (:...taskIds)', { taskIds })
            .andWhere('focused_time.recordedAt >= :sevenDaysAgo', { sevenDaysAgo })
            .groupBy('DATE(focused_time.recordedAt)')
            .orderBy('date', 'DESC')
            .getRawMany();

        // Calculate total focused time
        const total_focused_time_in_7_days = focusedTimeRecords.reduce((sum, record) => {
            return sum + parseInt(record.focused_time || 0);
        }, 0);

        // Fill in missing dates with zero focused time
        const allDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            allDates.push(date.toISOString().split('T')[0]);
        }

        return {
            message: "Focused time records for last 7 days retrieved successfully",
            statusCode: 200,
            data: {
                total_focused_time_in_7_days,
                total_estimated_time_in_7_days,
            }
        };
    }
}
