import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { Task } from './entities/task.entity';
import { PromptController } from './prompt/prompt.controller';
import { PromptService } from './prompt/prompt.service';
import { PromptModule } from './prompt/prompt.module';
import { FocusedTimeModule } from './focused_time/focused_time.module';
import { FocusedTime } from './entities/focused-time.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Task, FocusedTime],
        synchronize: true,
        logging: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    UserModule,
    AuthModule,
    TaskModule,
    PromptModule,
    FocusedTimeModule
  ],
  controllers: [AppController, PromptController],
  providers: [AppService, PromptService],
})
export class AppModule {}
