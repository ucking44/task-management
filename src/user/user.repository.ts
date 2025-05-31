import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends Repository<User> 
{
    constructor(private dataSource: DataSource) 
    {
        super(User, dataSource.createEntityManager());
    }

    async findActiveUsers(): Promise<User[]> 
    {
        return this.find({ where: { isActive: true } });
    }

    async findByEmail(email: string): Promise<User | null> 
    {
        return this.findOne({ where: { email } });
    }
}
