import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService 
{
    constructor(private readonly userRepository: UserRepository, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    async create(createUserDto: CreateUserDto): Promise<User> 
    {
        const hash = await bcrypt.hash(createUserDto.password, 10);
        const user = this.userRepository.create({ ...createUserDto, password: hash });
        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> 
    {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User> 
    {
        const cacheKey = `user:id:${id}`;
        const cached = await this.cacheManager.get<User>(cacheKey);
        if (cached) return cached;

        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        await this.cacheManager.set(cacheKey, user, 60 * 5);
        return user;
    }

    async update(id: string, dto: UpdateUserDto): Promise<User> 
    {
        const user = await this.findOne(id);
        Object.assign(user, dto);
        const updated = await this.userRepository.save(user);

        await this.cacheManager.del(`user:id:${id}`);
        await this.cacheManager.del(`user:email:${updated.email}`);
        return updated;
    }

    async remove(id: string): Promise<void> 
    {
        const user = await this.findOne(id);
        await this.userRepository.delete(id);
        await this.cacheManager.del(`user:id:${id}`);
        await this.cacheManager.del(`user:email:${user.email}`);
    }

    async findByEmail(email: string): Promise<User | null> 
    {
        const cacheKey = `user:email:${email}`;
        const cached = await this.cacheManager.get<User>(cacheKey);
        if (cached) return cached;

        const user = await this.userRepository.findByEmail(email);
        if (user) await this.cacheManager.set(cacheKey, user, 60 * 5);
        return user;
    }

    async emailExists(email: string): Promise<boolean> 
    {
        const user = await this.userRepository.findOne({ where: { email } });
        return !!user;
    }
}
