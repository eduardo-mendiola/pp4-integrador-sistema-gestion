export const moduleCards = [
  {
    key: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    permission: 'view_dashboard',
    allowedRoles: ['admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive']
  },
  {
    key: 'products',
    path: '/productos',
    label: 'Productos',
    allowedRoles: ['admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive']
  },
  {
    key: 'categories',
    path: '/categorias',
    label: 'Categorías',
    allowedRoles: ['admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive']
  },
  {
    key: 'clients',
    path: '/clientes',
    label: 'Clientes',
    permission: 'view_clients',
    allowedRoles: ['admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive']
  },
  {
    key: 'suppliers',
    path: '/proveedores',
    label: 'Proveedores',
    permission: 'view_suppliers',
    allowedRoles: ['admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive']
  },
  {
    key: 'sales',
    path: '/ventas',
    label: 'Ventas',
    allowedRoles: ['admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive']
  },
  {
    key: 'users',
    path: '/usuarios',
    label: 'Usuarios',
    permission: 'view_users',
    allowedRoles: ['admin', 'Administrador', 'CEO']
  }
];
