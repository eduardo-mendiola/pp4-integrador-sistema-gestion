export const permissionCategories = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    permissions: ['view_dashboard']
  },
  {
    id: 'personal_data',
    label: 'Datos Personales',
    permissions: ['view_personal_data', 'create_personal_data', 'edit_personal_data', 'delete_personal_data']
  },
  {
    id: 'clients',
    label: 'Clientes',
    permissions: ['view_clients', 'create_clients', 'edit_clients', 'delete_clients']
  },
  {
    id: 'products',
    label: 'Productos',
    permissions: ['view_products', 'create_products', 'edit_products', 'delete_products']
  },
  {
    id: 'categories',
    label: 'Categorías',
    permissions: ['view_categories', 'create_categories', 'edit_categories', 'delete_categories']
  },
  {
    id: 'suppliers',
    label: 'Proveedores',
    permissions: ['view_suppliers', 'create_suppliers', 'edit_suppliers', 'delete_suppliers']
  },
  {
    id: 'supplier_payments',
    label: 'Pagos a Proveedores',
    permissions: ['view_supplier_payments', 'create_supplier_payments', 'edit_supplier_payments', 'delete_supplier_payments']
  },
  {
    id: 'promotions',
    label: 'Promociones',
    permissions: ['view_promotions', 'create_promotions', 'edit_promotions', 'delete_promotions']
  },
  {
    id: 'discounts',
    label: 'Descuentos',
    permissions: ['view_discount_rules', 'create_discount_rules', 'edit_discount_rules', 'delete_discount_rules']
  },
  {
    id: 'sales',
    label: 'Ventas',
    permissions: ['view_sales', 'create_sales', 'edit_sales', 'delete_sales']
  },
  {
    id: 'payment_methods',
    label: 'Métodos de Pago',
    permissions: ['view_payment_methods', 'create_payment_methods', 'edit_payment_methods', 'delete_payment_methods']
  },
  {
    id: 'cash_register',
    label: 'Caja',
    permissions: ['view_cash_register', 'open_cash_register', 'close_cash_register']
  },
  {
    id: 'cash_flow',
    label: 'Movimientos de Caja',
    permissions: ['view_cash_flow', 'create_cash_flow', 'delete_cash_flow']
  },
  {
    id: 'internal_vouchers',
    label: 'Comprobantes Internos',
    permissions: ['view_internal_vouchers', 'create_internal_vouchers', 'cancel_internal_vouchers']
  },
  {
    id: 'users',
    label: 'Usuarios',
    permissions: ['view_users', 'create_users', 'edit_users', 'delete_users']
  },
  {
    id: 'employees',
    label: 'Empleados',
    permissions: ['view_employees', 'create_employees', 'edit_employees', 'delete_employees']
  },
  {
    id: 'roles',
    label: 'Roles',
    permissions: ['view_roles', 'create_roles', 'edit_roles', 'delete_roles']
  },
  {
    id: 'reports',
    label: 'Reportes',
    permissions: ['view_reports', 'export_reports']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    permissions: ['view_analytics', 'export_analytics']
  }
];

// Labels de permisos
export const permissionLabels = {
  view_dashboard: "Ver Dashboard",
  
  view_personal_data: "Ver Datos Personales",
  create_personal_data: "Crear Datos Personales",
  edit_personal_data: "Editar Datos Personales",
  delete_personal_data: "Eliminar Datos Personales",
  
  view_clients: "Ver Clientes",
  create_clients: "Crear Clientes",
  edit_clients: "Editar Clientes",
  delete_clients: "Eliminar Clientes",
  
  view_products: "Ver Productos",
  create_products: "Crear Productos",
  edit_products: "Editar Productos",
  delete_products: "Eliminar Productos",
  
  view_categories: "Ver Categorías",
  create_categories: "Crear Categorías",
  edit_categories: "Editar Categorías",
  delete_categories: "Eliminar Categorías",
  
  view_suppliers: "Ver Proveedores",
  create_suppliers: "Crear Proveedores",
  edit_suppliers: "Editar Proveedores",
  delete_suppliers: "Eliminar Proveedores",
  
  view_supplier_payments: "Ver Pagos a Proveedores",
  create_supplier_payments: "Crear Pagos a Proveedores",
  edit_supplier_payments: "Editar Pagos a Proveedores",
  delete_supplier_payments: "Eliminar Pagos a Proveedores",
  
  view_promotions: "Ver Promociones",
  create_promotions: "Crear Promociones",
  edit_promotions: "Editar Promociones",
  delete_promotions: "Eliminar Promociones",
  
  view_discount_rules: "Ver Reglas de Descuento",
  create_discount_rules: "Crear Reglas de Descuento",
  edit_discount_rules: "Editar Reglas de Descuento",
  delete_discount_rules: "Eliminar Reglas de Descuento",
  
  view_sales: "Ver Ventas",
  create_sales: "Crear Ventas",
  edit_sales: "Editar Ventas",
  delete_sales: "Eliminar Ventas",
  
  view_payment_methods: "Ver Métodos de Pago",
  create_payment_methods: "Crear Métodos de Pago",
  edit_payment_methods: "Editar Métodos de Pago",
  delete_payment_methods: "Eliminar Métodos de Pago",
  
  view_cash_register: "Ver Estado de Caja",
  open_cash_register: "Aperturar Caja",
  close_cash_register: "Cerrar Caja",
  
  view_cash_flow: "Ver Movimientos de Caja",
  create_cash_flow: "Crear Movimientos de Caja",
  delete_cash_flow: "Eliminar Movimientos de Caja",
  
  view_internal_vouchers: "Ver Comprobantes Internos",
  create_internal_vouchers: "Crear Comprobantes Internos",
  cancel_internal_vouchers: "Cancelar Comprobantes Internos",
  
  view_users: "Ver Usuarios",
  create_users: "Crear Usuarios",
  edit_users: "Editar Usuarios",
  delete_users: "Eliminar Usuarios",
  
  view_employees: "Ver Empleados",
  create_employees: "Crear Empleados",
  edit_employees: "Editar Empleados",
  delete_employees: "Eliminar Empleados",
  
  view_roles: "Ver Roles",
  create_roles: "Crear Roles",
  edit_roles: "Editar Roles",
  delete_roles: "Eliminar Roles",
  
  view_reports: "Ver Reportes",
  export_reports: "Exportar Reportes",
  
  view_analytics: "Ver Analytics",
  export_analytics: "Exportar Analytics"
};

// Array con todos los permisos disponibles (para validación)
export const allPermissions = Object.keys(permissionLabels);