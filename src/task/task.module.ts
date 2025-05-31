import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [TaskController],
    providers: [TaskService, TaskRepository],
    exports: [TaskService, TaskRepository],
})
export class TaskModule {}
