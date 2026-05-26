import { allPermissions } from '../config/permissions.js';

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {Object} user - Objeto de usuario con role_id
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user?.role_id?.permissions) return false;
  
  // Validar que el permiso existe
  if (!allPermissions.includes(permission)) {
    console.warn(`Permiso solicitado inválido: ${permission}`);
    return false;
  }
  
  return user.role_id.permissions.includes(permission);
};

/**
 * Verifica si un usuario tiene todos los permisos solicitados
 * @param {Object} user - Objeto de usuario con role_id
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every(perm => hasPermission(user, perm));
};

/**
 * Verifica si un usuario tiene al menos uno de los permisos solicitados
 * @param {Object} user - Objeto de usuario con role_id
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some(perm => hasPermission(user, perm));
};

/**
 * Verifica si un usuario es administrador (tiene todos los permisos)
 * @param {Object} user - Objeto de usuario con role_id
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  if (!user?.role_id?.permissions) return false;
  return allPermissions.every(perm => user.role_id.permissions.includes(perm));
};

/**
 * Obtiene los permisos válidos de un usuario (filtra permisos inválidos)
 * @param {Object} user - Objeto de usuario con role_id
 * @returns {string[]} Array de permisos válidos
 */
export const getValidPermissions = (user) => {
  if (!user?.role_id?.permissions) return [];
  
  return user.role_id.permissions.filter(perm => allPermissions.includes(perm));
};

/**
 * Sanitiza los permisos de un rol eliminando los inválidos
 * @param {string[]} permissions - Array de permisos
 * @returns {string[]} Array de permisos válidos
 */
export const sanitizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  
  return permissions.filter(perm => allPermissions.includes(perm));
};

/**
 * Obtiene los permisos inválidos de un usuario
 * @param {Object} user - Objeto de usuario con role_id
 * @returns {string[]} Array de permisos inválidos
 */
export const getInvalidPermissions = (user) => {
  if (!user?.role_id?.permissions) return [];
  
  return user.role_id.permissions.filter(perm => !allPermissions.includes(perm));
};
