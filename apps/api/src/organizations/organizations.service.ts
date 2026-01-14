import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>
  ) {}

  async findById(id: string): Promise<Organization | null> {
    return this.organizationsRepository.findOne({ where: { id } });
  }

  async findOrCreateDefault(): Promise<Organization> {
    const existing = await this.organizationsRepository.findOne({
      where: { name: 'Default Organization' },
    });

    if (existing) {
      return existing;
    }

    const org = this.organizationsRepository.create({
      name: 'Default Organization',
    });

    return this.organizationsRepository.save(org);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationsRepository.find({
      relations: ['parent', 'children'],
    });
  }

  async getHierarchy(): Promise<Map<string, string | undefined>> {
    const orgs = await this.findAll();
    const hierarchy = new Map<string, string | undefined>();
    
    for (const org of orgs) {
      hierarchy.set(org.id, org.parentId);
    }
    
    return hierarchy;
  }

  async getChildOrganizations(parentId: string): Promise<string[]> {
    const children = await this.organizationsRepository.find({
      where: { parentId },
    });
    
    const childIds = children.map((c) => c.id);

    for (const child of children) {
      const grandchildren = await this.getChildOrganizations(child.id);
      childIds.push(...grandchildren);
    }
    
    return childIds;
  }
}
