import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../task/task.entity';

@Entity()
export class TaskLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  taskId: string;

  @Column()
  action: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Task, task => task.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;
}
