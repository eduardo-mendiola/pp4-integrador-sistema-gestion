/**
 * Integration Tests - Projects API
 * 
 * TDD Pattern: Red → Green → Refactor
 * 
 * 
 * Setup/Teardown:
 * - beforeAll: Conectar a MongoDB Memory Server
 * - beforeEach: Limpiar la base de datos para mantener tests aislados
 * - afterAll: Cerrar conexión a BD
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { connectDB, clearDatabase, disconnectDB } from '../helpers/testHelpers.js';
import { ProjectBuilder, ClientBuilder, EmployeeBuilder } from '../builders/dataBuilders.js';
import { VALID_PROJECT, INVALID_PROJECTS, FIXTURE_IDS } from '../fixtures/testData.js';
import Client from '../../src/models/ClientModel.js';
import Employee from '../../src/models/EmployeeModel.js';
import Position from '../../src/models/PositionModel.js';

describe('Integration Tests - POST /api/projects', () => {
  
  // Setup: Conectar a BD antes de todos los tests
  beforeAll(async () => {
    await connectDB();
  });

  // Setup: Limpiar BD antes de cada test para mantener aislamiento
  beforeEach(async () => {
    await clearDatabase();
  });

  // Teardown: Desconectar después de todos los tests
  afterAll(async () => {
    await disconnectDB();
  });

  /**
   * TDD - Test 1: RED
   * Verificar que se puede crear un proyecto con datos válidos
   */
  describe('Crear proyecto con datos válidos', () => {
    
    it('debe devolver status 201 y crear el proyecto exitosamente', async () => {
      // Arrange: Preparar datos de prueba
      // Crear cliente y empleado necesarios para el proyecto
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'Project Manager', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder()
          .withPosition(position._id)
          .build()
      );

      const projectPayload = new ProjectBuilder()
        .withName('Website Redesign')
        .withDescription('Complete redesign of company website')
        .withClient(client._id)
        .withManager(employee._id)
        .withBudget(50000)
        .inProgress()
        .build();

      // Act: Ejecutar la petición HTTP
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload)
        .expect('Content-Type', /json/);

      // Assert: Verificar resultado
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Website Redesign');
      expect(response.body.description).toBe('Complete redesign of company website');
      expect(response.body.budget).toBe(50000);
      expect(response.body.status).toBe('in_progress');
      
      // Verificar que el id es un ObjectId válido de MongoDB
      expectValidMongoId(response.body.id);
      
      // Verificar que se crearon timestamps
      expectValidTimestamp(response.body.created_at);
      expectValidTimestamp(response.body.updated_at);
    });

    it('debe generar un código único automáticamente', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'Project Manager', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager(employee._id)
        .build();

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('code');
      expect(response.body.code).toMatch(/^PRJ-[a-f0-9]+$/i);
    });

    it('debe crear proyecto con tipo de facturación "hourly"', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'Project Manager', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager(employee._id)
        .withBillingType('hourly')
        .build();

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload)
        .expect(201);

      // Assert
      expect(response.body.billing_type).toBe('hourly');
    });
  });

  /**
   * TDD - Test 2: RED
   * Verificar validaciones de campos requeridos
   */
  describe('Validación de campos requeridos', () => {
    
    it('debe retornar 400 cuando falta el nombre del proyecto', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager(employee._id)
        .buildWithout('name'); // Crear sin el campo name

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/name|nombre|required|requerido/i);
    });

    it('debe retornar 400 cuando falta el client_id', async () => {
      // Arrange
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withManager(employee._id)
        .buildWithout('client_id');

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/client|required|requerido/i);
    });

    it('debe retornar 400 cuando falta el project_manager', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .buildWithout('project_manager');

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/manager|required|requerido/i);
    });
  });

  /**
   * TDD - Test 3: RED
   * Verificar validaciones de enums (valores permitidos)
   */
  describe('Validación de enumeraciones', () => {
    
    it('debe retornar 400 con billing_type inválido', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager(employee._id)
        .build();
      
      projectPayload.billing_type = 'invalid_type'; // Tipo inválido

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('debe retornar 400 con status inválido', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager(employee._id)
        .build();
      
      projectPayload.status = 'invalid_status'; // Status inválido

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('debe aceptar todos los valores válidos de status', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const validStatuses = ['pending', 'in_progress', 'completed'];

      // Act & Assert
      for (const status of validStatuses) {
        const projectPayload = new ProjectBuilder()
          .withClient(client._id)
          .withManager(employee._id)
          .build();
        
        projectPayload.status = status;

        const response = await request(app)
          .post('/api/projects')
          .send(projectPayload);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe(status);
      }
    });
  });

  /**
   * TDD - Test 4: RED
   * Verificar que las relaciones (referencias) son válidas
   */
  describe('Validación de referencias a otras colecciones', () => {
    
    it('debe retornar 400 con ObjectId de cliente inválido', async () => {
      // Arrange
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient('invalid_object_id') // ID inválido
        .withManager(employee._id)
        .build();

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('debe retornar 400 con ObjectId de manager inválido', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager('invalid_object_id') // ID inválido
        .build();

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  /**
   * TDD - Test 5: GREEN
   * Verificar campos opcionales
   */
  describe('Campos opcionales', () => {
    
    it('debe crear proyecto sin descripción', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager(employee._id)
        .buildWithout('description');

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload)
        .expect(201);

      // Assert
      expect(response.body.name).toBeDefined();
      expect(response.body.description).toBeUndefined();
    });

    it('debe crear proyecto sin fechas', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = new ProjectBuilder()
        .withClient(client._id)
        .withManager(employee._id)
        .buildWithout('start_date', 'end_date');

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload)
        .expect(201);

      // Assert
      expect(response.body.start_date).toBeUndefined();
      expect(response.body.end_date).toBeUndefined();
    });

    it('debe usar valores por defecto cuando no se especifican', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const projectPayload = {
        name: 'Minimal Project',
        client_id: client._id,
        project_manager: employee._id
      };

      // Act
      const response = await request(app)
        .post('/api/projects')
        .send(projectPayload)
        .expect(201);

      // Assert
      expect(response.body.status).toBe('pending'); // Default
      expect(response.body.billing_type).toBe('fixed'); // Default
    });
  });
});
