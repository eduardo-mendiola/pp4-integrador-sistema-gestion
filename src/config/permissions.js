export const allPermissions = [
  'view_dashboard',

  'create_clients',
  'view_clients',
  'edit_clients',
  'delete_clients',

  'create_contacts',
  'view_contacts',
  'edit_contacts',
  'delete_contacts',

  'create_projects',
  'view_projects',
  'edit_projects',
  'delete_projects',

  'create_tasks',
  'view_tasks',
  'edit_tasks',
  'delete_tasks',
  'view_all_tasks',

  'create_time_entries',
  'view_time_entries',
  'edit_time_entries',
  'delete_time_entries',
  'view_all_time_entries',

  'create_document_files',
  'view_document_files',
  'edit_document_files',
  'delete_document_files',
  'view_all_document_files',

  'create_invoices',
  'view_invoices',
  'edit_invoices',
  'delete_invoices',

  'create_payments',
  'view_payments',
  'edit_payments',
  'delete_payments',

  'create_receipts',
  'view_receipts',
  'edit_receipts',
  'delete_receipts',

  'create_estimates',
  'view_estimates',
  'edit_estimates',
  'delete_estimates',

  'create_expenses',
  'view_expenses',
  'edit_expenses',
  'delete_expenses',

  'create_expense_categories',
  'view_expense_categories',
  'edit_expense_categories',
  'delete_expense_categories',

  'create_users',
  'view_users',
  'edit_users',
  'delete_users',

  'create_employees',
  'view_employees',
  'edit_employees',
  'delete_employees',

  'create_roles',
  'view_roles',
  'edit_roles',
  'delete_roles',

  'create_areas',
  'view_areas',
  'edit_areas',
  'delete_areas',

  'create_positions',
  'view_positions',
  'edit_positions',
  'delete_positions',

  'create_teams',
  'view_teams',
  'edit_teams',
  'delete_teams',

  'create_team_roles',
  'view_team_roles',
  'edit_team_roles',
  'delete_team_roles',

  // Permisos ejecutivos y dashboards
  'view_executive_dashboard',
  'view_financial_reports',
  'view_client_reports',
  'view_project_reports',
  'view_revenue_analysis',
  'view_profitability_analysis',
  'export_reports',
  'view_all_invoices',
  'view_all_payments',
  'view_all_receipts',

  // Chat
  'view_chat'
];

export const permissionLabels = {
  view_dashboard: "Dashboard: Ver",

  create_clients: "Clientes: Crear",
  view_clients: "Clientes: Ver",
  edit_clients: "Clientes: Editar",
  delete_clients: "Clientes: Eliminar",

  create_contacts: "Contactos: Crear",
  view_contacts: "Contactos: Ver",
  edit_contacts: "Contactos: Editar",
  delete_contacts: "Contactos: Eliminar",

  create_projects: "Proyectos: Crear",
  view_projects: "Proyectos: Ver",
  edit_projects: "Proyectos: Editar",
  delete_projects: "Proyectos: Eliminar",

  create_tasks: "Tareas: Crear",
  view_tasks: "Tareas: Ver",
  edit_tasks: "Tareas: Editar",
  delete_tasks: "Tareas: Eliminar",
  view_all_tasks: "Tareas: Ver Todas (Admin)",

  create_time_entries: "Registro de Actividades: Crear",
  view_time_entries: "Registro de Actividades: Ver",
  edit_time_entries: "Registro de Actividades: Editar",
  delete_time_entries: "Registro de Actividades: Eliminar",
  view_all_time_entries: "Registro de Actividades: Ver Todas (Admin)",

  create_document_files: "Documentos: Crear",
  view_document_files: "Documentos: Ver",
  edit_document_files: "Documentos: Editar",
  delete_document_files: "Documentos: Eliminar",
  view_all_document_files: "Documentos: Ver Todos (Admin)",

  create_invoices: "Facturas: Crear",
  view_invoices: "Facturas: Ver",
  edit_invoices: "Facturas: Editar",
  delete_invoices: "Facturas: Eliminar",

  create_payments: "Pagos: Crear",
  view_payments: "Pagos: Ver",
  edit_payments: "Pagos: Editar",
  delete_payments: "Pagos: Eliminar",

  create_receipts: "Cobros: Crear",
  view_receipts: "Cobros: Ver",
  edit_receipts: "Cobros: Editar",
  delete_receipts: "Cobros: Eliminar",

  create_estimates: "Presupuestos: Crear",
  view_estimates: "Presupuestos: Ver",
  edit_estimates: "Presupuestos: Editar",
  delete_estimates: "Presupuestos: Eliminar",

  create_expenses: "Gastos: Crear",
  view_expenses: "Gastos: Ver",
  edit_expenses: "Gastos: Editar",
  delete_expenses: "Gastos: Eliminar",

  create_expense_categories: "Categorías de Gastos: Crear",
  view_expense_categories: "Categorías de Gastos: Ver",
  edit_expense_categories: "Categorías de Gastos: Editar",
  delete_expense_categories: "Categorías de Gastos: Eliminar",

  create_users: "Usuarios: Crear",
  view_users: "Usuarios: Ver",
  edit_users: "Usuarios: Editar",
  delete_users: "Usuarios: Eliminar",

  create_employees: "Empleados: Crear",
  view_employees: "Empleados: Ver",
  edit_employees: "Empleados: Editar",
  delete_employees: "Empleados: Eliminar",

  create_roles: "Roles: Crear",
  view_roles: "Roles: Ver",
  edit_roles: "Roles: Editar",
  delete_roles: "Roles: Eliminar",

  create_areas: "Áreas: Crear",
  view_areas: "Áreas: Ver",
  edit_areas: "Áreas: Editar",
  delete_areas: "Áreas: Eliminar",

  create_positions: "Cargos: Crear",
  view_positions: "Cargos: Ver",
  edit_positions: "Cargos: Editar",
  delete_positions: "Cargos: Eliminar",

  create_teams: "Equipos: Crear",
  view_teams: "Equipos: Ver",
  edit_teams: "Equipos: Editar",
  delete_teams: "Equipos: Eliminar",

  create_team_roles: "Roles de Equipo: Crear",
  view_team_roles: "Roles de Equipo: Ver",
  edit_team_roles: "Roles de Equipo: Editar",
  delete_team_roles: "Roles de Equipo: Eliminar",

  // Etiquetas para permisos ejecutivos
  view_executive_dashboard: "Dashboard Ejecutivo: Ver",
  view_financial_reports: "Reportes Financieros: Ver",
  view_client_reports: "Reportes de Clientes: Ver",
  view_project_reports: "Reportes de Proyectos: Ver",
  view_revenue_analysis: "Análisis de Ingresos: Ver",
  view_profitability_analysis: "Análisis de Rentabilidad: Ver",
  export_reports: "Reportes: Exportar",
  view_all_invoices: "Facturas: Ver Todas (Admin)",
  view_all_payments: "Pagos: Ver Todos (Admin)",
  view_all_receipts: "Cobros: Ver Todos (Admin)",

  // Chat
  view_chat: "Chat: Ver y Usar"
};
