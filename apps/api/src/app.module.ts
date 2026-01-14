import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuditModule } from './audit/audit.module';
import { User } from './users/user.entity';
import { Organization } from './organizations/organization.entity';
import { Task } from './tasks/task.entity';
import { AuditLog } from './audit/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env['DATABASE_PATH'] || 'task-management.db',
      entities: [User, Organization, Task, AuditLog],
      synchronize: true, 
      logging: process.env['NODE_ENV'] === 'development',
    }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TasksModule,
    AuditModule,
  ],
})
export class AppModule {}
