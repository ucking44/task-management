import { TaskPriority } from "src/enum/taskPriority.enum";
import { TaskStatus } from "src/enum/taskStatus.enum";
import { User } from "src/user/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskLog } from "./taskLog.entity";

@Entity()
export class Task {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @ManyToOne(() => User, user => user.assignedTasks, { eager: true })
    @JoinColumn({ name: 'assignedTo' })
    assignedTo: User;

    @ManyToOne(() => User, user => user.createdTasks, { eager: true })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
    status: TaskStatus;

    @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
    priority: TaskPriority;

    @Column({ type: 'timestamp', nullable: true })
    dueDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => TaskLog, log => log.task)
    logs: TaskLog[];    
}
