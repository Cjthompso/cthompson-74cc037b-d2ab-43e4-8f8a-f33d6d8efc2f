import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  action!: string;

  @Column()
  resource!: string;

  @Column()
  resourceId!: string;

  @Column()
  userId!: string;

  @Column()
  userEmail!: string;

  @Column()
  organizationId!: string;

  @Column({ nullable: true })
  details?: string;

  @CreateDateColumn()
  timestamp!: Date;
}
