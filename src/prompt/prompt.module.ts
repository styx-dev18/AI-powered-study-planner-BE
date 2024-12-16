import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { ConfigModule } from '@nestjs/config';
import { PromptController } from './prompt.controller';
import { TaskModule } from 'src/task/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Task, User]),
        UserModule,
        TaskModule
    ],
    providers: [PromptService],
    controllers: [PromptController],
})

export class PromptModule { }
