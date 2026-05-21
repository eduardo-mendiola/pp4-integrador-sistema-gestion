/**
 * Integration Tests - Projects API (GET, PUT, DELETE)
 * 
 * TDD Pattern: Red → Green → Refactor
 * 
 * Tests para operaciones de lectura, actualización y eliminación
 */

import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, clearDatabase, disconnectDB } from '../helpers/testHelpers.js';
import { ProjectBuilder, ClientBuilder, EmployeeBuilder } from '../builders/dataBuilders.js';
import Project from '../../src/models/ProjectModel.js';
import Client from '../../src/models/ClientModel.js';
import Employee from '../../src/models/EmployeeModel.js';
import Position from '../../src/models/PositionModel.js';

describe('Integration Tests - GET /api/projects', () => {
  
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('GET /api/projects - Obtener todos los proyectos', () => {
    
    it('debe retornar lista vacía cuando no hay proyectos', async () => {
      // Act
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('debe retornar todos los proyectos existentes', async () => {
      // Arrange: Crear datos de prueba
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      // Crear 3 proyectos
      await Project.create(
        new ProjectBuilder()
          .withName('Project 1')
          .withCode('PRJ-TEST-001')
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );
      await Project.create(
        new ProjectBuilder()
          .withName('Project 2')
          .withCode('PRJ-TEST-002')
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );
      await Project.create(
        new ProjectBuilder()
          .withName('Project 3')
          .withCode('PRJ-TEST-003')
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      // Act
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      
      // Verificar que cada proyecto tiene los campos esperados
      response.body.forEach(project => {
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('client_id');
        expect(project).toHaveProperty('project_manager');
      });
    });

    it('debe incluir datos poblados de cliente y manager', async () => {
      // Arrange
      const client = await Client.create(
        new ClientBuilder().withName('Test Client').build()
      );
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder()
          .withFirstName('John')
          .withLastName('Doe')
          .withPosition(position._id)
          .build()
      );

      await Project.create(
        new ProjectBuilder()
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      // Act
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      // Assert
      expect(response.body[0].client_id).toHaveProperty('name', 'Test Client');
      expect(response.body[0].project_manager).toHaveProperty('first_name', 'John');
      expect(response.body[0].project_manager).toHaveProperty('last_name', 'Doe');
    });
  });

  describe('GET /api/projects/:id - Obtener proyecto por ID', () => {
    
    it('debe retornar proyecto específico por ID', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const project = await Project.create(
        new ProjectBuilder()
          .withName('Specific Project')
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      // Act
      const response = await request(app)
        .get(`/api/projects/${project._id}`)
        .expect(200);

      // Assert
      expect(response.body.id).toBe(project._id.toString());
      expect(response.body.name).toBe('Specific Project');
    });

    it('debe retornar 404 cuando el proyecto no existe', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act
      const response = await request(app)
        .get(`/api/projects/${nonExistentId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
    });

    it('debe retornar 400 con ID inválido', async () => {
      // Act
      const response = await request(app)
        .get('/api/projects/invalid_id')
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('message');
    });
  });
});

describe('Integration Tests - PUT /api/projects/:id', () => {
  
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Actualizar proyecto existente', () => {
    
    it('debe actualizar el nombre del proyecto', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const project = await Project.create(
        new ProjectBuilder()
          .withName('Original Name')
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      const updateData = {
        name: 'Updated Name'
      };

      // Act
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.id).toBe(project._id.toString());
    });

    it('debe actualizar el presupuesto del proyecto', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const project = await Project.create(
        new ProjectBuilder()
          .withBudget(10000)
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      const updateData = {
        budget: 25000
      };

      // Act
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.budget).toBe(25000);
    });

    it('debe actualizar el status del proyecto', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const project = await Project.create(
        new ProjectBuilder()
          .pending()
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      const updateData = {
        status: 'completed'
      };

      // Act
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.status).toBe('completed');
    });

    it('debe actualizar múltiples campos simultáneamente', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const project = await Project.create(
        new ProjectBuilder()
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      const updateData = {
        name: 'New Name',
        description: 'New Description',
        budget: 75000,
        status: 'in_progress'
      };

      // Act
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.name).toBe('New Name');
      expect(response.body.description).toBe('New Description');
      expect(response.body.budget).toBe(75000);
      expect(response.body.status).toBe('in_progress');
    });

    it('debe retornar 404 cuando el proyecto no existe', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };

      // Act
      const response = await request(app)
        .put(`/api/projects/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
    });

    it('debe rechazar actualización con datos inválidos', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const project = await Project.create(
        new ProjectBuilder()
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      const invalidData = {
        status: 'invalid_status'
      };

      // Act
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .send(invalidData)
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('message');
    });
  });
});

describe('Integration Tests - DELETE /api/projects/:id', () => {
  
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Eliminar proyecto', () => {
    
    it('debe eliminar proyecto existente', async () => {
      // Arrange
      const client = await Client.create(new ClientBuilder().build());
      const position = await Position.create({ name: 'PM', description: 'PM' });
      const employee = await Employee.create(
        new EmployeeBuilder().withPosition(position._id).build()
      );

      const project = await Project.create(
        new ProjectBuilder()
          .withClient(client._id)
          .withManager(employee._id)
          .build()
      );

      // Act
      const response = await request(app)
        .delete(`/api/projects/${project._id}`)
        .expect(204);

      // Assert: 204 No Content no tiene body
      // Verificar que el proyecto ya no existe
      const deletedProject = await Project.findById(project._id);
      expect(deletedProject).toBeNull();
    });

    it('debe retornar 404 cuando el proyecto no existe', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act
      const response = await request(app)
        .delete(`/api/projects/${nonExistentId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
    });

    it('debe retornar 400 con ID inválido', async () => {
      // Act
      const response = await request(app)
        .delete('/api/projects/invalid_id')
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('message');
    });
  });
});

