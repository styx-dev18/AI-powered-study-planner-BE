import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, IsDate, IsDateString } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['High', 'Medium', 'Low'])
    priority: 'High' | 'Medium' | 'Low';

    @IsInt()
    @IsOptional()
    estimated_time?: number;

    @IsDateString()
    @IsOptional()
    opened_at?: Date;

    @IsDateString()
    @IsOptional()
    dued_at?: Date;
}

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['High', 'Medium', 'Low'])
    @IsOptional()
    priority?: 'High' | 'Medium' | 'Low';

    @IsEnum(['Todo', 'In Progress', 'Completed', 'Expired'])
    @IsOptional()
    status?: 'Todo' | 'In Progress' | 'Completed' | 'Expired';

    @IsInt()
    @IsOptional()
    estimated_time?: number;

    @IsDateString()
    @IsOptional()
    opened_at?: Date;

    @IsDateString()
    @IsOptional()
    dued_at?: Date;
}
