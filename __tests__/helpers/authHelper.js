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
        // PRODUCTS
        'view_products',
        'create_products',
        'edit_products',
        'delete_products',

        // SALES
        'view_sales',
        'create_sales',
        'edit_sales',
        'delete_sales',

        // CLIENTS (si los sigues usando en el sistema)
        'view_clients',
        'create_clients',
        'edit_clients',
        'delete_clients',

        // EMPLOYEES (si aplica en tu sistema)
        'view_employees',
        'create_employees',
        'edit_employees',
        'delete_employees',

        // GLOBAL
        'view_all'
      ]
    },
    ...overrides
  };
};

/**
 * Middleware que bypasea autenticación en modo test
 */
export const bypassAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    req.user = createMockUser();
    req.isAuthenticated = () => true;
  }
  next();
};

/**
 * Configuración base para requests en tests
 */
export const setupAuthForTests = () => {
  return {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
};
