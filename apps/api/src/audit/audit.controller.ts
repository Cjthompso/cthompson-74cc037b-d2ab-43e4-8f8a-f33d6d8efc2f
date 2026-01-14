import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../shared/types';

@Controller('audit-log')
@UseGuards(RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  async getAuditLogs(@CurrentUser() user: { organizationId: string; role: Role }) {
    if (user.role === Role.OWNER) {
      return this.auditService.findAll();
    }
    return this.auditService.findByOrganization(user.organizationId);
  }
}
