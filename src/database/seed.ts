import { AppDataSource } from './data-source';
import { User } from 'src/user/user.entity';
import { Task } from 'src/task/task.entity';
import * as bcrypt from 'bcryptjs';
import { UserRole } from 'src/enum/role.enum';
import { TaskPriority } from 'src/enum/taskPriority.enum';
import { TaskStatus } from 'src/enum/taskStatus.enum';

async function seed() {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const taskRepo = AppDataSource.getRepository(Task);

    //// Clear existing data (optional for dev)
    await taskRepo.delete({});
    await userRepo.delete({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = userRepo.create({
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        password: adminPassword,
    });

    const user = userRepo.create({
        email: 'user@example.com',
        firstName: 'Normal',
        lastName: 'User',
        role: UserRole.USER,
        password: userPassword,
    });

    await userRepo.save([admin, user]);

    const task1 = taskRepo.create({
        title: 'Seeded Task 1',
        description: 'This is a seeded task',
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        createdBy: admin,
        assignedTo: user,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    await taskRepo.save(task1);

    console.log('Seed data inserted!');
    await AppDataSource.destroy();
}

seed().catch((e) => {
    console.error('Error seeding data', e);
    process.exit(1);
});
