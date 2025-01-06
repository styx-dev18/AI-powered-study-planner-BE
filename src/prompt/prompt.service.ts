import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import { TaskService } from 'src/task/task.service';
import { UserService } from 'src/user/user.service';
config();

@Injectable()
export class PromptService {
    private genAI: GoogleGenerativeAI;
    private genAIModel: any;

    constructor(private readonly config: ConfigService, private readonly taskRepository: TaskService, private readonly userRepository: UserService) {
        this.genAI = new GoogleGenerativeAI(process.env.API_KEY);
        this.genAIModel = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash-8b',
        });
    }

    async getPromptResponse(userId: string): Promise<{ message: string, statusCode: number }> {
        try {
            const user = await this.userRepository.findOneById(userId);

            if (!user) {
                throw new NotFoundException("User not found.");
            }
            
            const getTaskResponse = await this.taskRepository.getTasksByUser(userId);
            const tasks = getTaskResponse.data;

            if (tasks.length === 0) {
                return {
                    message: "User have no task.",
                    statusCode: 200,
                }
            }

            const prompt = "Analyze (and display in a beautifully formatted Markdown document without tables) the following task schedule. Provide feedback on potential improvements by considering the following aspects: 1. Warning about overly tight schedules that may lead to user burnout, especially on days with a high task load. 2. Suggest ways to redistribute tasks across dates for a healthier balance. 3. Recommend prioritization changes to improve focus and balance, such as reorganizing tasks to address high - priority items earlier or deferring lower - priority tasks. 4. Highlight risks of inefficiencies or unmanageable workloads and provide actionable suggestions to optimize the schedule. ** Here is the schedule data:** ";
            const result = await this.genAIModel.generateContent(`${prompt} ${JSON.stringify(tasks)}`);
            const response = await result.response;
            const text = response.text();

            return {
                message: text,
                statusCode: 200,
            };
        } catch (error) {
            return {
                message: error.message,
                statusCode: 500,
            }
        }

    }

    async getPromptWithStringResponse(userId: string, prompt: string): Promise<{ message: string, statusCode: number }> {
        try {
            const user = await this.userRepository.findOneById(userId);

            if (!user) {
                throw new NotFoundException("User not found.");
            }

            const result = await this.genAIModel.generateContent(`${prompt}`);
            const response = await result.response;
            const text = response.text();

            return {
                message: text,
                statusCode: 200,
            };
        } catch (error) {
            return {
                message: error.message,
                statusCode: 500,
            }
        }

    }
}