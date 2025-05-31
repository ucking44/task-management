import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/auth/login (POST) - fail login', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'wrong@test.com', password: 'wrong' });
        expect(res.status).toBe(401);
    });

    // Add a valid user in DB first before this test
    // it('/auth/login (POST) - success login', async () => {
    //   const res = await request(app.getHttpServer())
    //     .post('/auth/login')
    //     .send({ email: 'admin@test.com', password: 'admin' });
    //   expect(res.status).toBe(200);
    //   expect(res.body.access_token).toBeDefined();
    // });
});
