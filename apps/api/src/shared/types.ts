export enum Role {
  OWNER = 'Role.OWNER',
  ADMIN = 'Role.ADMIN',
  VIEWER = 'Role.VIEWER',
}

export enum Permission {
  CREATE_TASK = 'create_task',
  READ_TASK = 'read_task',
  UPDATE_TASK = 'update_task',
  DELETE_TASK = 'delete_task',
  VIEW_AUDIT_LOG = 'view_audit_log',
  MANAGE_USERS = 'manage_users',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  URGENT = 'urgent',
  OTHER = 'other',
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganization {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category: TaskCategory;
  order: number;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail: string;
  organizationId: string;
  details?: string;
  timestamp: Date;
}

export interface IAuthPayload {
  sub: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  order?: number;
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<IUser, 'password'>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    Permission.CREATE_TASK,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_AUDIT_LOG,
    Permission.MANAGE_USERS,
  ],
  [Role.ADMIN]: [
    Permission.CREATE_TASK,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_AUDIT_LOG,
  ],
  [Role.VIEWER]: [Permission.READ_TASK,
      Permission.UPDATE_TASK,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessOrganization(
  userOrgId: string,
  targetOrgId: string,
  orgHierarchy: Map<string, string | undefined>
): boolean {
  if (userOrgId === targetOrgId) return true;
  
  let currentOrg = targetOrgId;
  while (currentOrg) {
    const parentId = orgHierarchy.get(currentOrg);
    if (parentId === userOrgId) return true;
    if (!parentId) break;
    currentOrg = parentId;
  }
  
  return false;
}

export function checkPermission(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function canPerformAction(
  userRole: Role,
  userOrgId: string,
  resourceOrgId: string,
  requiredPermission: Permission,
  isOwner: boolean = false
): { allowed: boolean; reason?: string } {
  if (!checkPermission(userRole, requiredPermission)) {
    return {
      allowed: false,
      reason: `Role ${userRole} does not have permission ${requiredPermission}`,
    };
  }

  if (userRole === Role.OWNER && userOrgId === resourceOrgId) {
    return { allowed: true };
  }

  if (userRole === Role.ADMIN && userOrgId === resourceOrgId) {
    return { allowed: true };
  }

  if (userRole === Role.VIEWER) {
    if (requiredPermission !== Permission.READ_TASK) {
      return { allowed: false, reason: 'Viewers can only read tasks' };
    }
    if (userOrgId !== resourceOrgId) {
      return { allowed: false, reason: 'Cannot access resources from different organization' };
    }
    return { allowed: true };
  }

  if (
    requiredPermission === Permission.UPDATE_TASK ||
    requiredPermission === Permission.DELETE_TASK
  ) {
    if (!isOwner && userRole !== Role.ADMIN && userRole !== Role.OWNER) {
      return { allowed: false, reason: 'Can only modify your own tasks' };
    }
  }

  return { allowed: true };
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.OWNER]: 3,
  [Role.ADMIN]: 2,
  [Role.VIEWER]: 1,
};

export function isRoleHigherOrEqual(roleA: Role, roleB: Role): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}
