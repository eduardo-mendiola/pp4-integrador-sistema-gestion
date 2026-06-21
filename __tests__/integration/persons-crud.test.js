/**
 * Integration Tests - Persons API (CRUD completo)
 * 
 * TDD Pattern: Red → Green → Refactor
 */

import request from 'supertest';
import app from '../../src/app.js';
import {
  connectDB,
  clearDatabase,
  disconnectDB
} from '../helpers/testHelpers.js';

import Person from '../../src/models/PersonModel.js';

describe('Integration Tests - Persons API', () => {

  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  describe('POST /api/persons - Crear persona', () => {

    it('debe crear una persona correctamente', async () => {
      // Arrange
      const payload = {
        dni: '33333333',
        first_name: 'Carlos',
        last_name: 'López',
        email: 'carlos@test.com',
        phone: '1155556666'
      };

      // Act
      const response = await request(app)
        .post('/api/persons')
        .send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dni).toBe('33333333');
      expect(response.body.data.first_name).toBe('Carlos');
      expect(response.body.data.last_name).toBe('López');
    });

    it('debe crear persona con dirección completa', async () => {
      // Arrange
      const payload = {
        dni: '44444444',
        first_name: 'Ana',
        last_name: 'Martínez',
        email: 'ana@test.com',
        address: {
          street: 'Av. Corrientes',
          number: '1234',
          neighborhood: 'Microcentro',
          city: 'Buenos Aires'
        }
      };

      // Act
      const response = await request(app)
        .post('/api/persons')
        .send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.address).toBeDefined();
      expect(response.body.data.address.street).toBe('Av. Corrientes');
      expect(response.body.data.address.city).toBe('Buenos Aires');
    });

    it('debe fallar si falta DNI', async () => {
      // Arrange
      const payload = {
        first_name: 'Sin',
        last_name: 'DNI'
      };

      // Act
      const response = await request(app)
        .post('/api/persons')
        .send(payload);

      // Assert
      expect(response.status).toBe(400);
    });

    it('debe fallar si falta nombre', async () => {
      // Arrange
      const payload = {
        dni: '55555555',
        last_name: 'SinNombre'
      };

      // Act
      const response = await request(app)
        .post('/api/persons')
        .send(payload);

      // Assert
      expect(response.status).toBe(400);
    });

    it('debe fallar si DNI ya existe', async () => {
      // Arrange
      await Person.create({
        dni: '66666666',
        first_name: 'Existente',
        last_name: 'Persona'
      });

      const payload = {
        dni: '66666666',
        first_name: 'Duplicado',
        last_name: 'Persona'
      };

      // Act
      const response = await request(app)
        .post('/api/persons')
        .send(payload);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/persons - Obtener personas', () => {

    it('debe retornar lista vacía si no hay personas', async () => {
      // Act
      const response = await request(app)
        .get('/api/persons');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('debe retornar todas las personas', async () => {
      // Arrange
      await Person.create({
        dni: '11111111',
        first_name: 'Persona',
        last_name: 'Uno'
      });

      await Person.create({
        dni: '22222222',
        first_name: 'Persona',
        last_name: 'Dos'
      });

      // Act
      const response = await request(app)
        .get('/api/persons');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
    });

    it('debe retornar persona por ID', async () => {
      // Arrange
      const person = await Person.create({
        dni: '33333333',
        first_name: 'Test',
        last_name: 'User'
      });

      // Act
      const response = await request(app)
        .get(`/api/persons/${person._id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.dni).toBe('33333333');
    });

    it('debe retornar 404 si no existe', async () => {
      // Act
      const response = await request(app)
        .get('/api/persons/507f1f77bcf86cd799439011');

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/persons/:id - Actualizar persona', () => {

    it('debe actualizar campos de persona', async () => {
      // Arrange
      const person = await Person.create({
        dni: '44444444',
        first_name: 'Original',
        last_name: 'Nombre'
      });

      // Act
      const response = await request(app)
        .patch(`/api/persons/${person._id}`)
        .send({ first_name: 'Actualizado', email: 'nuevo@test.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.first_name).toBe('Actualizado');
      expect(response.body.data.email).toBe('nuevo@test.com');
    });

    it('no debe permitir modificar DNI', async () => {
      // Arrange
      const person = await Person.create({
        dni: '55555555',
        first_name: 'Test',
        last_name: 'User'
      });

      // Act
      const response = await request(app)
        .patch(`/api/persons/${person._id}`)
        .send({ dni: '99999999' });

      // Assert
      expect(response.status).toBe(200);
      // El DNI no debería cambiar
      const updated = await Person.findById(person._id);
      expect(updated.dni).toBe('55555555');
    });

    it('debe actualizar dirección parcialmente', async () => {
      // Arrange
      const person = await Person.create({
        dni: '66666666',
        first_name: 'Test',
        last_name: 'User',
        address: {
          street: 'Calle Original',
          number: '123',
          city: 'Ciudad Original'
        }
      });

      // Act
      const response = await request(app)
        .patch(`/api/persons/${person._id}`)
        .send({ 
          address: { 
            city: 'Ciudad Nueva' 
          } 
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.address.city).toBe('Ciudad Nueva');
      expect(response.body.data.address.street).toBe('Calle Original');
    });
  });

  describe('DELETE /api/persons/:id - Eliminar persona', () => {

    it('debe eliminar persona existente', async () => {
      // Arrange
      const person = await Person.create({
        dni: '77777777',
        first_name: 'Eliminar',
        last_name: 'Me'
      });

      // Act
      const response = await request(app)
        .delete(`/api/persons/${person._id}`);

      // Assert
      expect(response.status).toBe(200);
      
      const deleted = await Person.findById(person._id);
      expect(deleted).toBeNull();
    });

    it('debe retornar 404 si no existe', async () => {
      // Act
      const response = await request(app)
        .delete('/api/persons/507f1f77bcf86cd799439011');

      // Assert
      expect(response.status).toBe(404);
    });
  });
});