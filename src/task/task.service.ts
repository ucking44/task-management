import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../user/user.entity';
import { TaskStatus } from 'src/enum/taskStatus.enum';
import { FindTasksQueryDto } from './dto/FindTasksQueryDto.dto';
import { DataSource } from 'typeorm';
import { TaskLog } from './taskLog.entity';

@Injectable()
export class TaskService {
    constructor(
        private readonly taskRepository: TaskRepository, 
        @Inject(CACHE_MANAGER) private cacheManager: Cache, 
        private readonly dataSource: DataSource
    ) {}

    async create(taskDto: CreateTaskDto): Promise<Task> 
    {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try 
        {
            const task = this.taskRepository.create({
                ...taskDto,
                assignedTo: { id: taskDto.assignedTo } as any,
                createdBy: { id: taskDto.createdBy } as any,
            });

            const savedTask = await queryRunner.manager.save(task);

            const log = queryRunner.manager.create(TaskLog, {
                taskId: savedTask.id,
                action: 'CREATED',
            });
            await queryRunner.manager.save(log);

            await this.cacheManager.del('tasks_cache');
            await queryRunner.commitTransaction();
            return savedTask;
        } 
        catch (err) 
        {
            await queryRunner.rollbackTransaction();
            throw err;
        } 
        finally 
        {
            await queryRunner.release();
        }
    }

    async findAll(query: FindTasksQueryDto): Promise<{ data: Task[]; total: number }> 
    {
        const cacheKey = `tasks_cache_${JSON.stringify(query)}`;
        const cached = await this.cacheManager.get<{ data: Task[]; total: number }>(cacheKey);
        if (cached) return cached;

        const [data, total] = await this.taskRepository.findPaginated(query);
        await this.cacheManager.set(cacheKey, { data, total }, 60);
        return { data, total };
    }

    async findOne(id: string): Promise<Task> 
    {
        const task = await this.taskRepository.findOne({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async update(id: string, dto: UpdateTaskDto): Promise<Task> 
    {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try 
        {
            const repo = queryRunner.manager.withRepository(this.taskRepository);
            const task = await repo.findOne({ where: { id } });
            if (!task) throw new NotFoundException('Task not found');

            if (dto.assignedTo) 
            {
                task.assignedTo = { id: dto.assignedTo } as any;
            }
            if (dto.createdBy) 
            {
                task.createdBy = { id: dto.createdBy } as any;
            }
            if (dto.status === TaskStatus.COMPLETED && !task.completedAt) 
            {
                task.completedAt = new Date();
            }

            Object.assign(task, {
                ...dto,
                assignedTo: task.assignedTo,
                createdBy: task.createdBy,
            });

            const updated = await repo.save(task);

            const log = queryRunner.manager.create(TaskLog, {
                taskId: updated.id,
                action: 'UPDATED',
            });
            await queryRunner.manager.save(log);

            await this.cacheManager.del('tasks_cache');
            await queryRunner.commitTransaction();
            return updated;
        } 
        catch (err) 
        {
            await queryRunner.rollbackTransaction();
            throw err;
        } 
        finally 
        {
            await queryRunner.release();
        }
    }

    async remove(id: string): Promise<void> 
    {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try 
        {
            const repo = queryRunner.manager.withRepository(this.taskRepository);
            await repo.delete(id);

            const log = queryRunner.manager.create(TaskLog, {
                taskId: id,
                action: 'DELETED',
            });
            await queryRunner.manager.save(log);

            await this.cacheManager.del('tasks_cache');
            await queryRunner.commitTransaction();
        } 
        catch (err) 
        {
            await queryRunner.rollbackTransaction();
            throw err;
        } 
        finally 
        {
            await queryRunner.release();
        }
    }

    async findTasksByUser(userId: string): Promise<Task[]> 
    {
        return this.taskRepository.findByUser(userId);
    }

    async getLogsForTask(taskId: string): Promise<TaskLog[]> 
    {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');

        return this.dataSource.getRepository(TaskLog).find({
            where: { taskId },
            order: { createdAt: 'DESC' },
        });
    }

    async findAllAdmin(): Promise<Task[]> 
    {
        const cacheKey = 'tasks_admin_cache';
        const cached = await this.cacheManager.get<Task[]>(cacheKey);
        if (cached) return cached;

        const tasks = await this.taskRepository.find({
            relations: ['assignedTo', 'createdBy'],
            order: { createdAt: 'DESC' },
        });

        await this.cacheManager.set(cacheKey, tasks, 60);
        return tasks;
    }
}
