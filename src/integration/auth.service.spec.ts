import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../src/user/user.service';
import * as bcrypt from 'bcryptjs';

const mockUserService = {
    findByEmail: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: mockUserService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should validate user with correct credentials', async () => {
        const user = { id: '1', email: 'test@test.com', password: await bcrypt.hash('pass', 10) };
        mockUserService.findByEmail.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(true) as unknown as never);
        //jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

        const result = await service.validateUser('test@test.com', 'pass');
        expect(result).toMatchObject({ id: '1', email: 'test@test.com' });
    });

    it('should return null for invalid password', async () => {
        mockUserService.findByEmail.mockResolvedValue({ password: await bcrypt.hash('pass', 10) });
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(false) as unknown as never);
        //jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        const result = await service.validateUser('test@test.com', 'wrong');
        expect(result).toBeNull();
    });

    it('should return null if user is not found', async () => {
        mockUserService.findByEmail.mockResolvedValue(null);
        const result = await service.validateUser('unknown@test.com', 'pass');
        expect(result).toBeNull();
    });

    it('should return token on login', async () => {
        const result = await service.login({ id: '1', role: 'USER' });
        expect(result.access_token).toBe('mock-token');
        expect(result.user).toEqual({ id: '1', role: 'USER' });
    });
});
