import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    app.enableCors({
        origin: "*",    /// ['http://localhost:3000'],
        methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
        allowedHeaders: "*",
        credentials: true,
    });

    app.use(helmet());

    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: 'Too many requests, please try again later.',
        })
    );

    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
