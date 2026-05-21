/**
 * Builder Pattern for Test Data
 */

import mongoose from 'mongoose';

/**
 * Builder para crear proyectos de prueba
 */
export class ProjectBuilder {
  constructor() {
    // Valores por defecto 
    this.project = {
      name: 'Test Project',
      description: 'Test project description',
      client_id: new mongoose.Types.ObjectId(),
      project_manager: new mongoose.Types.ObjectId(),
      budget: 10000,
      billing_type: 'fixed',
      status: 'pending',
      start_date: new Date(),
      teams: []
    };
  }

  withName(name) {
    this.project.name = name;
    return this;
  }

  withDescription(description) {
    this.project.description = description;
    return this;
  }

  withClient(clientId) {
    this.project.client_id = clientId;
    return this;
  }

  withManager(managerId) {
    this.project.project_manager = managerId;
    return this;
  }

  withBudget(budget) {
    this.project.budget = budget;
    return this;
  }

  withBillingType(type) {
    this.project.billing_type = type;
    return this;
  }

  pending() {
    this.project.status = 'pending';
    return this;
  }

  inProgress() {
    this.project.status = 'in_progress';
    return this;
  }

  completed() {
    this.project.status = 'completed';
    return this;
  }

  withStartDate(date) {
    this.project.start_date = date;
    return this;
  }

  withEndDate(date) {
    this.project.end_date = date;
    return this;
  }

  withTeams(teamIds) {
    this.project.teams = teamIds.map(id => ({ team_id: id }));
    return this;
  }

  withCode(code) {
    this.project.code = code;
    return this;
  }

  build() {
    return { ...this.project };
  }

  // Helper para crear sin ciertos campos (testing de validaciones)
  buildWithout(...fields) {
    const project = { ...this.project };
    fields.forEach(field => delete project[field]);
    return project;
  }
}

/**
 * Builder para crear clientes de prueba
 */
export class ClientBuilder {
  constructor() {
    this.client = {
      client_type: 'company',
      name: 'Test Client',
      phone: '1234567890',
      address: {
        street: 'Test Street',
        number: '123',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country'
      },
      id_type: 'CUIT',
      id_number: '20-12345678-9',
      category: 'standard',
      is_active: true
    };
  }

  withName(name) {
    this.client.name = name;
    return this;
  }

  withClientType(type) {
    this.client.client_type = type;
    return this;
  }

  asPerson() {
    this.client.client_type = 'person';
    this.client.first_name = 'John';
    this.client.last_name = 'Doe';
    this.client.id_type = 'DNI';
    this.client.id_number = '12345678';
    delete this.client.name;
    return this;
  }

  asCompany() {
    this.client.client_type = 'company';
    this.client.name = 'Test Client';
    this.client.id_type = 'CUIT';
    this.client.id_number = '20-12345678-9';
    delete this.client.first_name;
    delete this.client.last_name;
    return this;
  }

  withPhone(phone) {
    this.client.phone = phone;
    return this;
  }

  withAddress(address) {
    this.client.address = address;
    return this;
  }

  withIdNumber(idNumber) {
    this.client.id_number = idNumber;
    return this;
  }

  active() {
    this.client.is_active = true;
    return this;
  }

  inactive() {
    this.client.is_active = false;
    return this;
  }

  build() {
    return { ...this.client };
  }

  buildWithout(...fields) {
    const client = { ...this.client };
    fields.forEach(field => delete client[field]);
    return client;
  }
}

/**
 * Builder para crear empleados de prueba
 */
export class EmployeeBuilder {
  constructor() {
    this.employee = {
      user_id: new mongoose.Types.ObjectId(),
      first_name: 'John',
      last_name: 'Doe',
      dni: '12345678',
      phone: '1234567890',
      area_id: new mongoose.Types.ObjectId(),
      hire_date: new Date(),
      position_id: new mongoose.Types.ObjectId(),
      employment_type: 'full-time',
      monthly_salary: 50000,
      is_active: true,
      address: {
        street: 'Test Street',
        number: '123',
        city: 'Test City',
        province: 'Test Province',
        country: 'Test Country',
        postal_code: '12345'
      }
    };
  }

  withFirstName(firstName) {
    this.employee.first_name = firstName;
    return this;
  }

  withLastName(lastName) {
    this.employee.last_name = lastName;
    return this;
  }

  withDni(dni) {
    this.employee.dni = dni;
    return this;
  }

  withUserId(userId) {
    this.employee.user_id = userId;
    return this;
  }

  withAreaId(areaId) {
    this.employee.area_id = areaId;
    return this;
  }

  withPhone(phone) {
    this.employee.phone = phone;
    return this;
  }

  withPosition(positionId) {
    this.employee.position_id = positionId;
    return this;
  }

  withSalary(salary) {
    this.employee.monthly_salary = salary;
    return this;
  }

  fullTime() {
    this.employee.employment_type = 'full-time';
    return this;
  }

  partTime() {
    this.employee.employment_type = 'part-time';
    return this;
  }

  contractor() {
    this.employee.employment_type = 'contractor';
    return this;
  }

  active() {
    this.employee.is_active = true;
    return this;
  }

  inactive() {
    this.employee.is_active = false;
    return this;
  }

  build() {
    return { ...this.employee };
  }

  buildWithout(...fields) {
    const employee = { ...this.employee };
    fields.forEach(field => delete employee[field]);
    return employee;
  }
}

/**
 * Builder para crear tareas de prueba
 */
export class TaskBuilder {
  constructor() {
    this.task = {
      title: 'Test Task',
      description: 'Test task description',
      project_id: new mongoose.Types.ObjectId(),
      assigned_to: new mongoose.Types.ObjectId(),
      status: 'pending',
      priority: 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    };
  }

  withTitle(title) {
    this.task.title = title;
    return this;
  }

  withDescription(description) {
    this.task.description = description;
    return this;
  }

  withProject(projectId) {
    this.task.project_id = projectId;
    return this;
  }

  assignedTo(employeeId) {
    this.task.assigned_to = employeeId;
    return this;
  }

  pending() {
    this.task.status = 'pending';
    return this;
  }

  inProgress() {
    this.task.status = 'in_progress';
    return this;
  }

  completed() {
    this.task.status = 'completed';
    return this;
  }

  withPriority(priority) {
    this.task.priority = priority;
    return this;
  }

  withDueDate(date) {
    this.task.due_date = date;
    return this;
  }

  build() {
    return { ...this.task };
  }

  buildWithout(...fields) {
    const task = { ...this.task };
    fields.forEach(field => delete task[field]);
    return task;
  }
}
