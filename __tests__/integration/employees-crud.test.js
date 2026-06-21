/**
 * Integration Tests - Employees API (CRUD completo con estados)
 * 
 * TDD Pattern: Red → Green → Refactor
 * 
 * Tests para operaciones CRUD de empleados incluyendo:
 * - Creación con register (persona + usuario + empleado)
 * - Actualización de estados (status, contract_status)
 * - Lógica automática: contrato terminado → inactivo
 */

import request from 'supertest';
import app from '../../src/app.js';
import {
  connectDB,
  clearDatabase,
  disconnectDB
} from '../helpers/testHelpers.js';

import Person from '../../src/models/PersonModel.js';
import Employee from '../../src/models/EmployeeModel.js';
import User from '../../src/models/UserModel.js';
import Role from '../../src/models/RoleModel.js';

describe('Integration Tests - Employees API', () => {

  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  describe('POST /api/employees/register - Registro completo', () => {

    it('debe crear usuario y empleado usando una persona existente', async () => {
      // Arrange - Datos de prueba claramente identificables
      const TEST_DATA = {
        person: {
          dni: 'TEST-DNI-99999999',
          first_name: 'TEST_Juan',
          last_name: 'TEST_Pérez',
          email: 'test.juan.perez@test-only.com'
        },
        user: {
          username: 'test_user_juan',
          email: 'test.juan.perez@test-only.com',
          password_hash: 'test_password_123',
        },
        employee: {
          hire_date: '2024-01-15',
          shift_schedule: 'full_time'
        }
      };

      // Crear rol de prueba
      const testRole = await Role.create({ 
        name: 'TEST_Empleado', 
        permissions: ['view_products'] 
      });

      // Limpiar datos previos por si acaso (defensa en profundidad)
      await Person.model.deleteMany({ dni: TEST_DATA.person.dni });
      await User.model.deleteMany({ username: TEST_DATA.user.username });

      // Crear persona primero (como hace el frontend)
      const person = await Person.create(TEST_DATA.person);

      // Agregar role_id al payload del usuario
      TEST_DATA.user.role_id = testRole._id.toString();

      // Enviar solo el person_id 
      const payload = {
        person_id: person._id.toString(),
        user: TEST_DATA.user,
        employee: TEST_DATA.employee
      };

      // Act
      const response = await request(app)
        .post('/api/employees/register')
        .send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('person');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('employee');
      
      expect(response.body.data.person.dni).toBe(TEST_DATA.person.dni);
      expect(response.body.data.user.username).toBe(TEST_DATA.user.username);
      expect(response.body.data.employee.shift_schedule).toBe(TEST_DATA.employee.shift_schedule);
    });

    it('debe fallar si no se proporciona person_id ni datos de persona', async () => {
      // Arrange
      const testRole = await Role.create({ 
        name: 'TEST_Empleado_Fail', 
        permissions: ['view_products'] 
      });

      const payload = {
        // Falta person_id y person
        user: {
          username: 'test_user_fail',
          email: 'test.fail@test-only.com',
          password_hash: 'test_password_123',
          role_id: testRole._id.toString()
        },
        employee: {
          hire_date: '2024-01-15',
          shift_schedule: 'full_time'
        }
      };

      // Act
      const response = await request(app)
        .post('/api/employees/register')
        .send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('person');
    });
  });

  describe('PATCH /api/employees/:id - Actualización de estados', () => {

    let testEmployee;
    let testRole;

    beforeEach(async () => {
      // Crear datos base para tests con nombres claramente identificables
      testRole = await Role.create({ 
        name: 'TEST_Empleado_PATCH', 
        permissions: ['view_products'] 
      });

      const person = await Person.create({
        dni: 'TEST-DNI-88888888',
        first_name: 'TEST_María',
        last_name: 'TEST_González',
        email: 'test.maria.gonzalez@test-only.com'
      });

      const user = await User.create({
        username: 'test_user_maria',
        email: 'test.maria.gonzalez@test-only.com',
        password_hash: 'test_password_123',
        role_id: testRole._id,
        person_id: person._id
      });

      testEmployee = await Employee.create({
        employee_code: 'TEST-EMP-PATCH-001',
        person_id: person._id,
        hire_date: new Date('2024-01-15'),
        shift_schedule: 'full_time',
        status: 'active',
        contract_status: 'active'
      });
    });

    it('debe cambiar estado a inactivo con motivo válido', async () => {
      // Arrange
      const updateData = {
        status: 'inactive',
        status_reason: 'license',
        status_comments: 'TEST: Licencia por 30 días'
      };

      // Act
      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inactive');
      expect(response.body.data.status_reason).toBe('license');
      expect(response.body.data.status_comments).toBe('TEST: Licencia por 30 días');
    });

    it('debe fallar si estado es inactivo sin motivo', async () => {
      // Arrange
      const updateData = {
        status: 'inactive'
        // Falta status_reason
      };

      // Act
      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('status_reason');
    });

    it('debe cambiar contrato a terminado y setear empleado como inactivo automáticamente', async () => {
      // Arrange
      const updateData = {
        contract_status: 'terminated',
        termination_date: '2024-12-31',
        termination_reason: 'resignation',
        termination_comments: 'TEST: Renuncia voluntaria'
      };

      // Act
      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.contract_status).toBe('terminated');
      expect(response.body.data.termination_date).toBeTruthy();
      expect(response.body.data.termination_reason).toBe('resignation');
      
      // Verificar lógica automática: empleado debe quedar inactivo
      expect(response.body.data.status).toBe('inactive');
      expect(response.body.data.status_reason).toBe('contract_end');
    });

    it('debe fallar si contrato terminado sin fecha', async () => {
      // Arrange
      const updateData = {
        contract_status: 'terminated',
        termination_reason: 'resignation'
        // Falta termination_date
      };

      // Act
      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('termination_date');
    });

    it('debe fallar si contrato terminado sin motivo', async () => {
      // Arrange
      const updateData = {
        contract_status: 'terminated',
        termination_date: '2024-12-31'
        // Falta termination_reason
      };

      // Act
      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('termination_reason');
    });

    it('debe limpiar datos de estado al volver a activo', async () => {
      // Arrange - Primero ponerlo inactivo
      await Employee.patch(testEmployee._id, {
        status: 'inactive',
        status_reason: 'suspension',
        status_comments: 'TEST: Suspensión temporal'
      });

      // Act - Volver a activo
      const response = await request(app)
        .patch(`/api/employees/${testEmployee._id}`)
        .send({ status: 'active' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.status_reason).toBeNull();
      expect(response.body.data.status_comments).toBeNull();
    });
  });

  describe('GET /api/employees - Obtener empleados', () => {

    it('debe retornar lista vacía si no hay empleados', async () => {
      // Act
      const response = await request(app)
        .get('/api/employees');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('debe retornar todos los empleados con sus relaciones', async () => {
      // Arrange
      const testRole = await Role.create({ 
        name: 'TEST_Empleado_GET', 
        permissions: ['view_products'] 
      });

      const person = await Person.create({
        dni: 'TEST-DNI-77777777',
        first_name: 'TEST_Get',
        last_name: 'TEST_User',
        email: 'test.get.user@test-only.com'
      });

      await Employee.create({
        employee_code: 'TEST-EMP-GET-001',
        person_id: person._id,
        hire_date: new Date('2024-01-15'),
        shift_schedule: 'full_time'
      });

      // Act
      const response = await request(app)
        .get('/api/employees');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('employee_code', 'TEST-EMP-GET-001');
      expect(response.body.data[0]).toHaveProperty('person_id');
    });
  });

  describe('DELETE /api/employees/:id - Eliminar empleado', () => {

    it('debe eliminar empleado existente', async () => {
      // Arrange
      const person = await Person.create({
        dni: 'TEST-DNI-66666666',
        first_name: 'TEST_Delete',
        last_name: 'TEST_Me',
        email: 'test.delete.me@test-only.com'
      });

      const employee = await Employee.create({
        employee_code: 'TEST-EMP-DELETE',
        person_id: person._id,
        hire_date: new Date('2024-01-15'),
        shift_schedule: 'full_time'
      });

      // Act
      const response = await request(app)
        .delete(`/api/employees/${employee._id}`);

      // Assert
      expect(response.status).toBe(200);
      
      const deleted = await Employee.findById(employee._id);
      expect(deleted).toBeNull();
    });

    it('debe retornar 404 si no existe', async () => {
      // Act
      const response = await request(app)
        .delete('/api/employees/507f1f77bcf86cd799439011');

      // Assert
      expect(response.status).toBe(404);
    });
  });
});