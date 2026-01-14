import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CreateTaskDto, UpdateTaskDto, Permission, Role } from '../shared/types';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  organizationId: string;
}

@Controller('tasks')
@UseGuards(PermissionsGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @Permissions(Permission.CREATE_TASK)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @Permissions(Permission.READ_TASK)
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.findAll(user);
  }

  @Get(':id')
  @Permissions(Permission.READ_TASK)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tasksService.findOne(id, user);
  }

  @Put(':id')
  @Permissions(Permission.UPDATE_TASK)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @Permissions(Permission.DELETE_TASK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.tasksService.remove(id, user);
    return { success: true, message: 'Task deleted successfully' };
  }
}
