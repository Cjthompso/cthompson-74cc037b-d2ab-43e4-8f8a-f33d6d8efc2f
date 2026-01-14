import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../shared/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';



@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private auditService: AuditService 
  ) {}

  @Get()
  @Roles(Role.OWNER)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      organizationId: u.organizationId,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));
  }

  @Put(':id/role')
  @Roles(Role.OWNER)
  async updateRole(
    @Param('id') id: string,
    @Body() body: { role: string },
    @CurrentUser() currentUser: any
  ) {
    const user = await this.usersService.updateRole(id, body.role as Role);
    
    await this.auditService.log({
      action: 'UPDATE',
      resource: 'user',
      resourceId: id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      organizationId: currentUser.organizationId,
      details: `Changed role to ${body.role}`
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId
    };
  }
}