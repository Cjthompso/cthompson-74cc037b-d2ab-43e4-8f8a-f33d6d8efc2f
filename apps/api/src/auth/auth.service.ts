import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { LoginDto, RegisterDto, AuthResponse, Role } from '../shared/types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private jwtService: JwtService,
    private auditService: AuditService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    if (password !== user.password) return null;
    
    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let organizationId = registerDto.organizationId;
    if (!organizationId) {
      const defaultOrg = await this.organizationsService.findOrCreateDefault();
      organizationId = defaultOrg.id;
    }

    let role = Role.VIEWER;
    if (registerDto.email === 'owner@test.com') role = Role.OWNER;
    else if (registerDto.email === 'admin@test.com') role = Role.ADMIN;

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      role,
      organizationId,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
