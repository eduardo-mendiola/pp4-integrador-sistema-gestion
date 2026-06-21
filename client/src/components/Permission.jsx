import { usePermission } from '../hooks/usePermission';

export const Permission = ({ permission, anyOf, allOf, children, fallback = null }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyOf && Array.isArray(anyOf)) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf && Array.isArray(allOf)) {
    hasAccess = hasAllPermissions(allOf);
  }

  return hasAccess ? children : fallback;
};