import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/user/user.service';
import { UserRepository } from '../../src/user/user.repository';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from 'src/enum/role.enum';

const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findByEmail: jest.fn(),
};

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: UserRepository, useValue: mockUserRepository },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should create a user with hashed password', async () => {
        const dto = {
            email: 'test@test.com',
            firstName: 'Test',
            lastName: 'User',
            role: UserRole.USER,
            password: '1234'
        };

        mockUserRepository.create.mockReturnValue(dto);
        mockUserRepository.save.mockResolvedValue(dto);

        const result = await service.create(dto);
        expect(mockUserRepository.create).toBeCalled();
        expect(result.password).not.toBe('1234');
    });

    it('should return all users', async () => {
        const users = [{ id: 1 }, { id: 2 }];
        mockUserRepository.find.mockResolvedValue(users);

        const result = await service.findAll();
        expect(result).toEqual(users);
    });

    it('should throw if user not found', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);
        await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });

    it('should update user fields', async () => {
        const user = { id: '1', firstName: 'Old', lastName: 'Name' };
        mockUserRepository.findOne.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue({ ...user, firstName: 'New' });

        const result = await service.update('1', { firstName: 'New' });
        expect(result.firstName).toBe('New');

    });
});
