import { DataSource, Repository } from 'typeorm';
import { Task } from './task.entity';
import { Injectable } from '@nestjs/common';
import { FindTasksQueryDto } from './dto/FindTasksQueryDto.dto';

@Injectable()
export class TaskRepository extends Repository<Task> 
{
    constructor(private dataSource: DataSource) 
    {
        super(Task, dataSource.createEntityManager());
    }

    async findByStatusAndPriority(status?: string, priority?: string): Promise<Task[]> 
    {
        const qb = this.createQueryBuilder('task');

        if (status) qb.andWhere('task.status = :status', { status });
        if (priority) qb.andWhere('task.priority = :priority', { priority });

        return qb.getMany();
    }

    async findByUser(userId: string): Promise<Task[]> 
    {
        return this.find({
            where: { assignedTo: { id: userId } },
            relations: ['assignedTo'],
        });
    }

    async findPaginated(query: FindTasksQueryDto): Promise<[Task[], number]> 
    {
        const { status, priority, page = '1', limit = '10' } = query;
        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;

        const qb = this.createQueryBuilder('task')
        .leftJoinAndSelect('task.assignedTo', 'assignedTo')
        .leftJoinAndSelect('task.createdBy', 'createdBy')
        .select([
            'task.id',
            'task.title',
            'task.status',
            'task.priority',
            'task.dueDate',
            'task.completedAt',
            'assignedTo.id',
            'assignedTo.firstName',
            'assignedTo.lastName',
            'createdBy.id',
            'createdBy.firstName',
        ])
        .orderBy('task.createdAt', 'DESC')
        .skip(skip)
        .take(take);

        if (status) qb.andWhere('task.status = :status', { status });
        if (priority) qb.andWhere('task.priority = :priority', { priority });

        const [data, total] = await qb.getManyAndCount();
        return [data, total];
    }
}

