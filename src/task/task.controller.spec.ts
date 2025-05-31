import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../../src/task/task.controller';
import { TaskService } from '../../src/task/task.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../src/task/task.entity';
import { CacheModule } from '@nestjs/cache-manager';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

const mockTasks = [
    {
        id: '1',
        title: 'Test Task 1',
        status: 'OPEN',
        priority: 'HIGH',
        dueDate: new Date(),
        createdAt: new Date(),
        assignedTo: { id: 'u1', firstName: 'John', lastName: 'Doe' },
        createdBy: { id: 'u2', firstName: 'Jane' },
    },
];

describe('TaskController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, CacheModule.register()],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/tasks (GET) - should return paginated tasks', async () => {
        const response = await request(app.getHttpServer())
        .get('/tasks?page=1&limit=10')
        .set('Authorization', 'Bearer valid.jwt.token')
        .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(typeof response.body.total).toBe('number');
    });

    it('/tasks (GET) - with filters', async () => {
        const response = await request(app.getHttpServer())
        .get('/tasks?status=OPEN&priority=HIGH')
        .set('Authorization', 'Bearer valid.jwt.token')
        .expect(200);

        expect(response.body.data.every(task => task.status === 'OPEN')).toBe(true);
        expect(response.body.data.every(task => task.priority === 'HIGH')).toBe(true);
    });

    it('/tasks (GET) - cached response check', async () => {

        await request(app.getHttpServer())
        .get('/tasks?page=1&limit=5')
        .set('Authorization', 'Bearer valid.jwt.token')
        .expect(200);

        const response = await request(app.getHttpServer())
        .get('/tasks?page=1&limit=5')
        .set('Authorization', 'Bearer valid.jwt.token')
        .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
