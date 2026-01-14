import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskStatus, TaskCategory } from '../shared/types';
import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({
    type: 'simple-enum',
    enum: TaskCategory,
    default: TaskCategory.OTHER,
  })
  category!: TaskCategory;

  @Column({ default: 0 })
  order!: number;

  @Column()
  userId!: string;

  @Column()
  organizationId!: string;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Organization, (org) => org.tasks)
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
