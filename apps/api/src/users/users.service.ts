import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../shared/types';

interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: Role;
  organizationId: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({ where: { organizationId } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateRole(id: string, role: Role): Promise<User> {
    await this.usersRepository.update(id, { role });
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}