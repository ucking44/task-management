import { Module } from '@nestjs/common';
import { AppDataSource } from './data-source';
import { DataSource } from 'typeorm';

@Module({
    providers: [
        {
            provide: DataSource,
            useFactory: async () => {
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize();
                }
                return AppDataSource;
            },
        },
    ],
    exports: [DataSource],
})
export class DatabaseModule {}
