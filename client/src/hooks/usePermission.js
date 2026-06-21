// src/hooks/usePermission.js
import { useAuth } from '../context/AuthContext';

export const usePermission = () => {
  const { user, hasPermission: authHasPermission } = useAuth();

  const hasPermission = (permission) => {
    return authHasPermission(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!user || !user.role_id || !user.role_id.permissions) return false;
    return permissions.some(p => user.role_id.permissions.includes(p));
  };

  const hasAllPermissions = (permissions) => {
    if (!user || !user.role_id || !user.role_id.permissions) return false;
    return permissions.every(p => user.role_id.permissions.includes(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
};