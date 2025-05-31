import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskPriority } from 'src/enum/taskPriority.enum';
import { TaskStatus } from 'src/enum/taskStatus.enum';

export class UpdateTaskDto 
{
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    dueDate?: Date;

    @IsOptional()
    completedAt?: Date;

    @IsOptional()
    @IsUUID()
    assignedTo?: string;

    @IsOptional()
    @IsUUID()
    createdBy?: string;
}
