/**
 * Fixtures - Datos de prueba reutilizables.
 */

import mongoose from 'mongoose';

// IDs fijos para usar en tests (facilita debugging)
export const FIXTURE_IDS = {
  client1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
  client2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
  employee1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
  employee2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
  project1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
  project2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),
  team1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
  team2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439042'),
  position1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
  position2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439052'),
};

// Datos válidos para diferentes entidades
export const VALID_PROJECT = {
  name: 'Website Redesign',
  description: 'Complete website redesign project',
  client_id: FIXTURE_IDS.client1,
  project_manager: FIXTURE_IDS.employee1,
  budget: 50000,
  billing_type: 'fixed',
  status: 'in_progress',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-06-30')
};

export const VALID_CLIENT = {
  name: 'Acme Corporation',
  email: 'contact@acme.com',
  phone: '+1-555-0123',
  address: '123 Business St, Suite 100',
  tax_id: 'TAX-123456789',
  status: 'active'
};

export const VALID_EMPLOYEE = {
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@company.com',
  phone: '+1-555-0456',
  hire_date: new Date('2023-01-15'),
  position_id: FIXTURE_IDS.position1,
  salary: 75000,
  status: 'active'
};

export const VALID_TASK = {
  title: 'Implement Authentication',
  description: 'Implement JWT-based authentication system',
  project_id: FIXTURE_IDS.project1,
  assigned_to: FIXTURE_IDS.employee1,
  status: 'in_progress',
  priority: 'high',
  due_date: new Date('2024-02-15')
};

// Datos inválidos para testing de validaciones
export const INVALID_PROJECTS = {
  missingName: {
    description: 'Project without name',
    client_id: FIXTURE_IDS.client1,
    project_manager: FIXTURE_IDS.employee1
  },
  missingClient: {
    name: 'Project without client',
    project_manager: FIXTURE_IDS.employee1
  },
  missingManager: {
    name: 'Project without manager',
    client_id: FIXTURE_IDS.client1
  },
  invalidBillingType: {
    name: 'Invalid Billing Type Project',
    client_id: FIXTURE_IDS.client1,
    project_manager: FIXTURE_IDS.employee1,
    billing_type: 'invalid_type'
  },
  invalidStatus: {
    name: 'Invalid Status Project',
    client_id: FIXTURE_IDS.client1,
    project_manager: FIXTURE_IDS.employee1,
    status: 'invalid_status'
  },
  negativeBudget: {
    name: 'Negative Budget Project',
    client_id: FIXTURE_IDS.client1,
    project_manager: FIXTURE_IDS.employee1,
    budget: -1000
  }
};

// Mensajes de error esperados
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field) => `el valor ${field} es requerido`,
  INVALID_ENUM: (field, value) => `${value} no es un valor válido para ${field}`,
  INVALID_ID: 'ID inválido',
  NOT_FOUND: 'no encontrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado'
};
