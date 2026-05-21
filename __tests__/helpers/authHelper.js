/**
 * Helper de autenticación para tests
 * Proporciona bypass de autenticación para tests de integración
 */

import mongoose from 'mongoose';

/**
 * Mock de usuario con permisos completos para tests
 */
export const createMockUser = (overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    username: 'test_user',
    email: 'test@example.com',
    role_id: {
      _id: new mongoose.Types.ObjectId(),
      name: 'admin',
      permissions: [
        'view_projects',
        'create_projects',
        'edit_projects',
        'delete_projects',
        'view_clients',
        'create_clients',
        'edit_clients',
        'delete_clients',
        'view_employees',
        'create_employees',
        'edit_employees',
        'delete_employees',
        'view_tasks',
        'create_tasks',
        'edit_tasks',
        'delete_tasks',
        'view_all'
      ]
    },
    ...overrides
  };
};

/**
 * Middleware que bypasea autenticación en modo test
 * Inyecta un usuario mock con permisos completos
 */
export const bypassAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    req.user = createMockUser();
    req.isAuthenticated = () => true;
  }
  next();
};

/**
 * Función para configurar autenticación en tests de integración
 * Retorna headers y configuración necesaria para Supertest
 */
export const setupAuthForTests = () => {
  return {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
};
