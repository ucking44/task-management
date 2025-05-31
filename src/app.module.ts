import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis-yet';

@Module({
    imports: [
        CacheModule.registerAsync({
            useFactory: async () => ({
                store: redisStore,
                host: 'localhost',
                port: 6379,
                ttl: 60 * 5,
            }),
            isGlobal: true,
        }),
        UserModule, 
        AuthModule, 
        TaskModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
