import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from 'src/user/user.entity';
import { Task } from 'src/task/task.entity';
import { TaskLog } from 'src/task/taskLog.entity';
dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, Task, TaskLog],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
});
