import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  Role,
  Permission,
  TaskStatus,
  TaskCategory,
  canPerformAction,
} from '../shared/types';

import { AuditService } from '../audit/audit.service';
import { OrganizationsService } from '../organizations/organizations.service';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  organizationId: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private auditService: AuditService,
    private organizationsService: OrganizationsService
  ) {}

  async create(createTaskDto: CreateTaskDto, user: AuthenticatedUser): Promise<Task> {
    const accessCheck = canPerformAction(
      user.role,
      user.organizationId,
      user.organizationId,
      Permission.CREATE_TASK
    );

    if (!accessCheck.allowed) {
      throw new ForbiddenException(accessCheck.reason);
    }

    const maxOrder = await this.tasksRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId: user.id })
      .select('MAX(task.order)', 'max')
      .getRawOne();

    const task = this.tasksRepository.create({
      ...createTaskDto,
      status: createTaskDto.status || TaskStatus.TODO,
      category: createTaskDto.category || TaskCategory.OTHER,
      order: (maxOrder?.max || 0) + 1,
      userId: user.id,
      organizationId: user.organizationId,
    });

    const savedTask = await this.tasksRepository.save(task);

    await this.auditService.log({
      action: 'CREATE',
      resource: 'task',
      resourceId: savedTask.id,
      userId: user.id,
      userEmail: user.email,
      organizationId: user.organizationId,
      details: `Created task: ${savedTask.title}`,
    });

    return savedTask;
  }

  async findAll(user: AuthenticatedUser): Promise<Task[]> {
    const accessibleOrgIds = [user.organizationId];
    
    if (user.role === Role.OWNER) {
      const childOrgs = await this.organizationsService.getChildOrganizations(
        user.organizationId
      );
      accessibleOrgIds.push(...childOrgs);
    }

    if (user.role === Role.VIEWER) {
      return this.tasksRepository.find({
        where: { userId: user.id },
        order: { order: 'ASC' },
      });
    }
    return this.tasksRepository.find({
      where: { organizationId: In(accessibleOrgIds) },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string, user: AuthenticatedUser): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const isOwner = task.userId === user.id;
    const accessCheck = canPerformAction(
      user.role,
      user.organizationId,
      task.organizationId,
      Permission.READ_TASK,
      isOwner
    );

    if (!accessCheck.allowed) {
      throw new ForbiddenException(accessCheck.reason);
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: AuthenticatedUser
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isOwner = task.userId === user.id;
    const accessCheck = canPerformAction(
      user.role,
      user.organizationId,
      task.organizationId,
      Permission.UPDATE_TASK,
      isOwner
    );

    if (!accessCheck.allowed) {
      throw new ForbiddenException(accessCheck.reason);
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.tasksRepository.save(task);

    await this.auditService.log({
      action: 'UPDATE',
      resource: 'task',
      resourceId: task.id,
      userId: user.id,
      userEmail: user.email,
      organizationId: user.organizationId,
      details: `Updated task: ${task.title}`,
    });

    return updatedTask;
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isOwner = task.userId === user.id;
    const accessCheck = canPerformAction(
      user.role,
      user.organizationId,
      task.organizationId,
      Permission.DELETE_TASK,
      isOwner
    );

    if (!accessCheck.allowed) {
      throw new ForbiddenException(accessCheck.reason);
    }

    await this.auditService.log({
      action: 'DELETE',
      resource: 'task',
      resourceId: task.id,
      userId: user.id,
      userEmail: user.email,
      organizationId: user.organizationId,
      details: `Deleted task: ${task.title}`,
    });

    await this.tasksRepository.remove(task);
  }

  async reorder(
    taskId: string,
    newOrder: number,
    user: AuthenticatedUser
  ): Promise<Task> {
    const task = await this.findOne(taskId, user);
    task.order = newOrder;
    return this.tasksRepository.save(task);
  }
}
