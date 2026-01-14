import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

interface CreateAuditLogDto {
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail: string;
  organizationId: string;
  details?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    console.log(
      `[AUDIT] ${dto.action} on ${dto.resource}:${dto.resourceId} by ${dto.userEmail} - ${dto.details || ''}`
    );

    const auditLog = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(auditLog);
  }

  async findByOrganization(
    organizationId: string,
    limit = 100
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { organizationId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async findAll(limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}