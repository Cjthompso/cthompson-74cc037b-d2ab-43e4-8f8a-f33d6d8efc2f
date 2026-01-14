export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
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
  [Role.VIEWER]: [Permission.READ_TASK],
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
