import { Role, Permission, ROLE_PERMISSIONS, hasPermission } from '@task-mgmt/data';

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

export { Role, Permission, ROLE_PERMISSIONS };
