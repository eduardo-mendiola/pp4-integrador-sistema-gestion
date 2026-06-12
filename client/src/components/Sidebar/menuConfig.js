// Configuración del menú del Sidebar
// Estructura con items, subitems y permisos asociados

export const menuConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'FiHome',
    path: '/dashboard',
    permission: 'view_dashboard',
    submenu: null,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: 'FiUsers',
    permission: 'view_users',
    submenu: [
      {
        id: 'usuarios-list',
        label: 'Usuarios',
        path: '/usuarios',
        permission: 'view_users',
      },
      {
        id: 'roles',
        label: 'Roles',
        path: '/roles',
        permission: 'view_roles',
      },
      {
        id: 'empleados',
        label: 'Empleados',
        path: '/empleados',
        permission: 'view_employees',
      },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: 'FiUsers',
    path: '/clientes',
    permission: 'view_clients',
    submenu: null,
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: 'FiShoppingCart',
    permission: 'view_sales',
    submenu: [
      {
        id: 'nueva-venta',
        label: 'Nueva venta',
        path: '/ventas/nueva',
        permission: 'create_sales',
      },
      {
        id: 'lista-ventas',
        label: 'Lista de ventas',
        path: '/ventas',
        permission: 'view_sales',
      },
      {
        id: 'pagos-ventas',
        label: 'Pagos',
        path: '/ventas/pagos',
        permission: 'view_payment_methods',
      },
    ],
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: 'FiBox',
    permission: 'view_products',
    submenu: [
      {
        id: 'productos-list',
        label: 'Productos',
        path: '/productos',
        permission: 'view_products',
      },
      {
        id: 'stock',
        label: 'Stock',
        path: '/productos/stock',
        permission: 'view_products',
      },
      {
        id: 'categorias',
        label: 'Categorías',
        path: '/categorias',
        permission: 'view_categories',
      },
    ],
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: 'FiTruck',
    path: '/proveedores',
    permission: 'view_suppliers',
    submenu: null,
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: 'FiCreditCard',
    permission: 'view_payment_methods',
    submenu: [
      {
        id: 'metodos-pago',
        label: 'Métodos de pago',
        path: '/pagos/metodos',
        permission: 'view_payment_methods',
      },
    ],
  },
  {
    id: 'promociones',
    label: 'Promociones',
    icon: 'FiGift',
    permission: 'view_promotions',
    submenu: [
      {
        id: 'promociones-list',
        label: 'Promociones',
        path: '/promociones',
        permission: 'view_promotions',
      },
      {
        id: 'descuentos',
        label: 'Reglas de descuento',
        path: '/promociones/descuentos',
        permission: 'view_discount_rules',
      },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: 'FiBarChart2',
    path: '/reportes',
    permission: 'view_reports',
    submenu: null,
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'FiSettings',
    path: '/configuracion',
    permission: null, // Visible para todos (sin permiso específico)
    submenu: null,
  },
];
