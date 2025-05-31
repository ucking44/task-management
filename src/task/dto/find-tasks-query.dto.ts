import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FindTasksQueryDto 
{
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;
}
