import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Role } from '../shared/types';
import { Organization } from '../organizations/organization.entity';
import { Task } from '../tasks/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({
    type: 'simple-enum',
    enum: Role,
    default: Role.VIEWER,
  })
  role!: Role;

  @Column()
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.users)
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
