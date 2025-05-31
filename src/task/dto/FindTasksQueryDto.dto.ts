import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { TaskPriority } from 'src/enum/taskPriority.enum';
import { TaskStatus } from 'src/enum/taskStatus.enum';

export class FindTasksQueryDto 
{
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;
}
