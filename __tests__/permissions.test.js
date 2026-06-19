import { allPermissions, permissionLabels } from '../src/config/permissions.js';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  isAdmin, 
  getValidPermissions, 
  sanitizePermissions, 
  getInvalidPermissions 
} from '../src/utils/permissionHelpers.js';

describe('Permissions System', () => {
  
  const adminUser = {
    _id: '1',
    username: 'admin',
    role_id: {
      name: 'admin',
      permissions: allPermissions
    }
  };

  const managerUser = {
    _id: '2',
    username: 'manager',
    role_id: {
      name: 'manager',
      permissions: ['view_clients', 'create_clients', 'edit_clients', 'view_sales']
    }
  };

  describe('Permission Configuration', () => {
    test('should have all permissions with labels', () => {
      const missingLabels = allPermissions.filter(p => !permissionLabels[p]);
      expect(missingLabels).toHaveLength(0);
    });

    test('should not have orphaned labels', () => {
      const orphanedLabels = Object.keys(permissionLabels).filter(
        label => !allPermissions.includes(label)
      );
      expect(orphanedLabels).toHaveLength(0);
    });

    test('should have consistent permission format', () => {
      const invalidFormat = allPermissions.filter(p => !/^[a-z]+_[a-z_]+$/.test(p));
      expect(invalidFormat).toHaveLength(0);
    });

    test('should not have duplicate permissions', () => {
      const duplicates = allPermissions.filter(
        (p, idx, arr) => arr.indexOf(p) !== idx
      );
      expect(duplicates).toHaveLength(0);
    });

    test('should have minimum expected permissions', () => {
      expect(allPermissions.length).toBeGreaterThan(40);
      expect(allPermissions).toContain('view_clients');
      expect(allPermissions).toContain('view_users');
      expect(allPermissions).toContain('view_roles');
    });
  });

  describe('Permission Helper Functions', () => {
    test('hasPermission should verify permission correctly', () => {
      expect(hasPermission(adminUser, 'view_clients')).toBe(true);
      expect(hasPermission(managerUser, 'view_clients')).toBe(true);
      expect(hasPermission(managerUser, 'delete_users')).toBe(false);
      expect(hasPermission(null, 'view_clients')).toBe(false);
    });

    test('hasAllPermissions should check all permissions', () => {
      expect(
        hasAllPermissions(adminUser, ['view_clients', 'view_users', 'view_products'])
      ).toBe(true);
      expect(
        hasAllPermissions(managerUser, ['view_clients', 'view_users'])
      ).toBe(false);
    });

    test('hasAnyPermission should check at least one permission', () => {
      expect(
        hasAnyPermission(managerUser, ['view_clients', 'delete_users'])
      ).toBe(true);
      expect(
        hasAnyPermission(managerUser, ['view_users', 'edit_users'])
      ).toBe(false);
    });

    test('isAdmin should identify administrators', () => {
      expect(isAdmin(adminUser)).toBe(true);
      expect(isAdmin(managerUser)).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });

    test('getValidPermissions should filter valid permissions', () => {
      const userWithMixed = {
        role_id: {
          permissions: ['view_clients', 'invalid_perm', 'view_sales']
        }
      };
      const valid = getValidPermissions(userWithMixed);
      expect(valid).toHaveLength(2);
      expect(valid).toContain('view_clients');
      expect(valid).toContain('view_sales');
    });

    test('sanitizePermissions should remove invalid permissions', () => {
      const mixed = ['view_clients', 'invalid_perm', 'view_sales', 'old_permission'];
      const sanitized = sanitizePermissions(mixed);
      expect(sanitized).toHaveLength(2);
      expect(sanitized).toContain('view_clients');
      expect(sanitized).toContain('view_sales');
    });

    test('getInvalidPermissions should identify invalid permissions', () => {
      const userWithInvalid = {
        role_id: {
          permissions: ['view_clients', 'create_projects', 'invalid_permission', 'view_sales']
        }
      };
      const invalid = getInvalidPermissions(userWithInvalid);
      expect(invalid).toHaveLength(2);
      expect(invalid).toContain('create_projects');
      expect(invalid).toContain('invalid_permission');
    });
  });

  describe('Permission Categories', () => {
    test('should have permissions for all main entities', () => {
      const entities = ['clients', 'users', 'roles', 'sales', 'products', 'categories'];
      entities.forEach(entity => {
        const hasEntity = allPermissions.some(p => p.includes(entity));
        expect(hasEntity).toBe(true);
      });
    });

    test('should have CRUD permissions for most entities', () => {
      const entities = ['clients', 'users', 'roles', 'sales'];
      entities.forEach(entity => {
        const actions = ['view', 'create', 'edit', 'delete'];
        actions.forEach(action => {
          const permission = `${action}_${entity}`;
          expect(allPermissions).toContain(permission);
        });
      });
    });
  });
});
