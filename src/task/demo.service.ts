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

@Injectable()
export class TaskService {
    constructor(private readonly taskRepository: TaskRepository, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async create(taskDto: CreateTaskDto): Promise<Task> 
    {
        const task = this.taskRepository.create({
            ...taskDto,
            assignedTo: { id: taskDto.assignedTo } as User,
            createdBy: { id: taskDto.createdBy } as User,
        });

        const saved = await this.taskRepository.save(task);
        await ((this.cacheManager as any).store).reset(); // clear all cached task lists
        return saved;
    }

    async findAll(status?: string, priority?: string): Promise<Task[]> 
    {
        const cacheKey = `tasks_${status || 'all'}_${priority || 'all'}`;
        const cached = await this.cacheManager.get<Task[]>(cacheKey);
        if (cached) return cached;

        const tasks = await this.taskRepository.findByStatusAndPriority(status, priority);
        await this.cacheManager.set(cacheKey, tasks, 60);
        return tasks;
    }

    async findAllPaginated(query: FindTasksQueryDto): Promise<{ data: Task[]; total: number }> 
    {
        const { status, priority, page = '1', limit = '10' } = query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [data, total] = await this.taskRepository.findAndCount({
            where: {
                ...(status ? { status } : {}),
                ...(priority ? { priority } : {}),
            },
            relations: ['assignedTo', 'createdBy'],
            skip,
            take,
            order: { createdAt: 'DESC' },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                completedAt: true,
                assignedTo: { id: true, firstName: true, lastName: true },
                createdBy: { id: true, firstName: true },
            },
        });

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
        const task = await this.findOne(id);

        if (dto.assignedTo) 
        {
            task.assignedTo = { id: dto.assignedTo } as User;
        }

        if (dto.createdBy) 
        {
            task.createdBy = { id: dto.createdBy } as User;
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

        const updated = await this.taskRepository.save(task);
        await ((this.cacheManager as any).store).reset();
        return updated;
    }

    async remove(id: string): Promise<void> 
    {
        await this.taskRepository.delete(id);
        await ((this.cacheManager as any).store).reset();
    }

    async findTasksByUser(userId: string): Promise<Task[]> 
    {
        return this.taskRepository.findByUser(userId);
    }
}
