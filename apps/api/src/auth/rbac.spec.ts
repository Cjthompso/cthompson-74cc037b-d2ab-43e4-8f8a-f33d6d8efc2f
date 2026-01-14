import {
  Role,
  Permission,
  hasPermission,
  canPerformAction,
  isRoleHigherOrEqual,
} from '../shared/types';

describe('RBAC Logic', () => {
  describe('Role Permissions', () => {
    it('should allow Owner to have all permissions', () => {
      expect(hasPermission(Role.OWNER, Permission.CREATE_TASK)).toBe(true);
      expect(hasPermission(Role.OWNER, Permission.READ_TASK)).toBe(true);
      expect(hasPermission(Role.OWNER, Permission.UPDATE_TASK)).toBe(true);
      expect(hasPermission(Role.OWNER, Permission.DELETE_TASK)).toBe(true);
      expect(hasPermission(Role.OWNER, Permission.VIEW_AUDIT_LOG)).toBe(true);
      expect(hasPermission(Role.OWNER, Permission.MANAGE_USERS)).toBe(true);
    });

    it('should allow Admin to have task and audit permissions', () => {
      expect(hasPermission(Role.ADMIN, Permission.CREATE_TASK)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.READ_TASK)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.UPDATE_TASK)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.DELETE_TASK)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.VIEW_AUDIT_LOG)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.MANAGE_USERS)).toBe(false);
    });

    it('should only allow Viewer to read tasks', () => {
      expect(hasPermission(Role.VIEWER, Permission.CREATE_TASK)).toBe(false);
      expect(hasPermission(Role.VIEWER, Permission.READ_TASK)).toBe(true);
      expect(hasPermission(Role.VIEWER, Permission.UPDATE_TASK)).toBe(false);
      expect(hasPermission(Role.VIEWER, Permission.DELETE_TASK)).toBe(false);
      expect(hasPermission(Role.VIEWER, Permission.VIEW_AUDIT_LOG)).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    it('should correctly compare role levels', () => {
      expect(isRoleHigherOrEqual(Role.OWNER, Role.ADMIN)).toBe(true);
      expect(isRoleHigherOrEqual(Role.OWNER, Role.VIEWER)).toBe(true);
      expect(isRoleHigherOrEqual(Role.ADMIN, Role.VIEWER)).toBe(true);
      expect(isRoleHigherOrEqual(Role.VIEWER, Role.ADMIN)).toBe(false);
      expect(isRoleHigherOrEqual(Role.ADMIN, Role.OWNER)).toBe(false);
    });
  });

  describe('Access Control', () => {
    const orgId = 'org-1';
    const differentOrgId = 'org-2';

    it('should allow Owner to perform all actions in their org', () => {
      const result = canPerformAction(
        Role.OWNER,
        orgId,
        orgId,
        Permission.DELETE_TASK,
        false
      );
      expect(result.allowed).toBe(true);
    });

    it('should allow Admin to perform task actions in their org', () => {
      const result = canPerformAction(
        Role.ADMIN,
        orgId,
        orgId,
        Permission.UPDATE_TASK,
        false
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny Viewer from creating tasks', () => {
      const result = canPerformAction(
        Role.VIEWER,
        orgId,
        orgId,
        Permission.CREATE_TASK,
        false
      );
      expect(result.allowed).toBe(false);
    });

    it('should allow Viewer to read tasks in their org', () => {
      const result = canPerformAction(
        Role.VIEWER,
        orgId,
        orgId,
        Permission.READ_TASK,
        false
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny Viewer access to different org', () => {
      const result = canPerformAction(
        Role.VIEWER,
        orgId,
        differentOrgId,
        Permission.READ_TASK,
        false
      );
      expect(result.allowed).toBe(false);
    });
  });
});
