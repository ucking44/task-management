import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { TaskPriority } from "src/enum/taskPriority.enum";
import { TaskStatus } from "src/enum/taskStatus.enum";

export class CreateTaskDto {
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    assignedTo: string;

    @IsUUID()
    createdBy: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsOptional()
    dueDate?: Date;
}
