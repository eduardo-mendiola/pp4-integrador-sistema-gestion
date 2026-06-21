/**
 * Unit Tests - Permission Helpers
 * 
 * TDD Pattern: Arrange → Act → Assert
 * 
 * Tests para funciones puras de verificación de permisos.
 * No requieren mocks ni dependencias externas.
 */

import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isAdmin,
  getValidPermissions,
  sanitizePermissions,
  getInvalidPermissions
} from '../../src/utils/permissionHelpers.js';

describe('Unit Tests - Permission Helpers', () => {

  // Helper para crear usuarios de prueba
  const createUserWithPermissions = (permissions) => ({
    role_id: {
      permissions
    }
  });

  describe('hasPermission - Verificar permiso individual', () => {
    
    it('debe retornar true si el usuario tiene el permiso', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products', 'edit_products']);
      
      // Act
      const result = hasPermission(user, 'view_products');
      
      // Assert
      expect(result).toBe(true);
    });

    it('debe retornar false si el usuario no tiene el permiso', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products']);
      
      // Act
      const result = hasPermission(user, 'edit_products');
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si el permiso no existe en el sistema', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products']);
      
      // Act
      const result = hasPermission(user, 'invalid_permission');
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si el usuario es null', () => {
      // Arrange
      const user = null;
      
      // Act
      const result = hasPermission(user, 'view_products');
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si el usuario no tiene role_id', () => {
      // Arrange
      const user = {};
      
      // Act
      const result = hasPermission(user, 'view_products');
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si role_id no tiene permissions', () => {
      // Arrange
      const user = { role_id: {} };
      
      // Act
      const result = hasPermission(user, 'view_products');
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si permissions es un array vacío', () => {
      // Arrange
      const user = createUserWithPermissions([]);
      
      // Act
      const result = hasPermission(user, 'view_products');
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions - Verificar múltiples permisos', () => {
    
    it('debe retornar true si el usuario tiene todos los permisos', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products', 'edit_products', 'delete_products']);
      
      // Act
      const result = hasAllPermissions(user, ['view_products', 'edit_products']);
      
      // Assert
      expect(result).toBe(true);
    });

    it('debe retornar false si falta al menos un permiso', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products']);
      
      // Act
      const result = hasAllPermissions(user, ['view_products', 'edit_products']);
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar true si el array de permisos está vacío', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products']);
      
      // Act
      const result = hasAllPermissions(user, []);
      
      // Assert
      expect(result).toBe(true);
    });

    it('debe retornar false si el usuario es null', () => {
      // Arrange
      const user = null;
      
      // Act
      const result = hasAllPermissions(user, ['view_products']);
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasAnyPermission - Verificar al menos un permiso', () => {
    
    it('debe retornar true si el usuario tiene al menos uno de los permisos', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products']);
      
      // Act
      const result = hasAnyPermission(user, ['view_products', 'edit_products']);
      
      // Assert
      expect(result).toBe(true);
    });

    it('debe retornar false si el usuario no tiene ninguno de los permisos', () => {
      // Arrange
      const user = createUserWithPermissions(['view_clients']);
      
      // Act
      const result = hasAnyPermission(user, ['view_products', 'edit_products']);
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si el array de permisos está vacío', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products']);
      
      // Act
      const result = hasAnyPermission(user, []);
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si el usuario es null', () => {
      // Arrange
      const user = null;
      
      // Act
      const result = hasAnyPermission(user, ['view_products']);
      
      // Assert
      expect(result).toBe(false);
    });
  });

    describe('isAdmin - Verificar administrador', () => {
    
    it('debe retornar true si el usuario tiene todos los permisos del sistema', async () => {
      // Arrange
      const { allPermissions } = await import('../../src/config/permissions.js');
      const user = createUserWithPermissions(allPermissions);
      
      // Act
      const result = isAdmin(user);
      
      // Assert
      expect(result).toBe(true);
    });

    it('debe retornar false si falta al menos un permiso', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products', 'edit_products']);
      
      // Act
      const result = isAdmin(user);
      
      // Assert
      expect(result).toBe(false);
    });

    it('debe retornar false si el usuario es null', () => {
      // Arrange
      const user = null;
      
      // Act
      const result = isAdmin(user);
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getValidPermissions - Filtrar permisos válidos', () => {
    
    it('debe retornar solo los permisos válidos', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products', 'invalid_perm', 'edit_products']);
      
      // Act
      const result = getValidPermissions(user);
      
      // Assert
      expect(result).toEqual(['view_products', 'edit_products']);
    });

    it('debe retornar array vacío si no hay permisos válidos', () => {
      // Arrange
      const user = createUserWithPermissions(['invalid1', 'invalid2']);
      
      // Act
      const result = getValidPermissions(user);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío si el usuario es null', () => {
      // Arrange
      const user = null;
      
      // Act
      const result = getValidPermissions(user);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío si no tiene permissions', () => {
      // Arrange
      const user = { role_id: {} };
      
      // Act
      const result = getValidPermissions(user);
      
      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('sanitizePermissions - Sanitizar array de permisos', () => {
    
    it('debe retornar solo permisos válidos del array', () => {
      // Arrange
      const permissions = ['view_products', 'invalid_perm', 'edit_products'];
      
      // Act
      const result = sanitizePermissions(permissions);
      
      // Assert
      expect(result).toEqual(['view_products', 'edit_products']);
    });

    it('debe retornar array vacío si no es un array', () => {
      // Arrange
      const permissions = null;
      
      // Act
      const result = sanitizePermissions(permissions);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío si el input es undefined', () => {
      // Arrange
      const permissions = undefined;
      
      // Act
      const result = sanitizePermissions(permissions);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío si todos los permisos son inválidos', () => {
      // Arrange
      const permissions = ['invalid1', 'invalid2'];
      
      // Act
      const result = sanitizePermissions(permissions);
      
      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getInvalidPermissions - Obtener permisos inválidos', () => {
    
    it('debe retornar solo los permisos inválidos', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products', 'invalid_perm', 'edit_products']);
      
      // Act
      const result = getInvalidPermissions(user);
      
      // Assert
      expect(result).toEqual(['invalid_perm']);
    });

    it('debe retornar array vacío si todos los permisos son válidos', () => {
      // Arrange
      const user = createUserWithPermissions(['view_products', 'edit_products']);
      
      // Act
      const result = getInvalidPermissions(user);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío si el usuario es null', () => {
      // Arrange
      const user = null;
      
      // Act
      const result = getInvalidPermissions(user);
      
      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Casos de integración entre funciones', () => {
    
    it('un usuario con permisos inválidos no debería pasar validación', () => {
      // Arrange
      const user = createUserWithPermissions(['invalid_perm']);
      
      // Act
      const hasValid = hasPermission(user, 'view_products');
      const invalidPerms = getInvalidPermissions(user);
      
      // Assert
      expect(hasValid).toBe(false);
      expect(invalidPerms).toEqual(['invalid_perm']);
    });

    it('sanitizar y luego verificar debería funcionar correctamente', () => {
      // Arrange
      const permissions = ['view_products', 'invalid', 'edit_products'];
      
      // Act
      const sanitized = sanitizePermissions(permissions);
      const hasView = sanitized.includes('view_products');
      const hasEdit = sanitized.includes('edit_products');
      const hasInvalid = sanitized.includes('invalid');
      
      // Assert
      expect(hasView).toBe(true);
      expect(hasEdit).toBe(true);
      expect(hasInvalid).toBe(false);
    });
  });
});