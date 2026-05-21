/**
 * Test Helpers - Utilidades comunes para tests
 * 
 * Funciones auxiliares para setup, teardown y operaciones comunes
 * en tests de integración.
 * 
 * TDD Pattern: DRY - No repetir código entre tests
 */

import mongoose from 'mongoose';

/**
 * Conectar a MongoDB Memory Server
 * Usar en beforeAll de cada suite de tests
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI_TEST || global.__MONGO_URI__;
  
  if (!uri) {
    throw new Error('MONGO_URI_TEST no está definido');
  }

  await mongoose.connect(uri);
};

/**
 * Limpiar todas las colecciones de la base de datos
 * Útil para mantener tests aislados
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Desconectar de MongoDB
 * Usar en afterAll de cada suite de tests
 */
export const disconnectDB = async () => {
  await mongoose.connection.close();
};

/**
 * Crear un usuario de prueba con credenciales conocidas
 * Útil para tests que requieren autenticación
 */
export const createTestUser = async (UserModel, overrides = {}) => {
  const defaultUser = {
    username: 'testuser',
    password: 'Test123!',
    email: 'test@example.com',
    role: 'admin',
    ...overrides
  };

  const user = await UserModel.create(defaultUser);
  return user;
};

/**
 * Generar un ObjectId válido de MongoDB
 * Útil para crear referencias sin necesidad de crear documentos completos
 */
export const generateObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Validar estructura de error de API
 */
export const expectApiError = (response, expectedStatus, expectedMessage) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('error');
  if (expectedMessage) {
    expect(response.body.error).toContain(expectedMessage);
  }
};

/**
 * Esperar un tiempo determinado (útil para operaciones asíncronas)
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extraer solo campos relevantes de un objeto
 * Útil para comparar respuestas sin preocuparse por campos extra
 */
export const pickFields = (obj, fields) => {
  return fields.reduce((acc, field) => {
    if (obj[field] !== undefined) {
      acc[field] = obj[field];
    }
    return acc;
  }, {});
};

/**
 * Crear múltiples documentos de prueba
 */
export const createMany = async (Model, count, factory) => {
  const promises = Array.from({ length: count }, (_, i) => 
    Model.create(factory(i))
  );
  return Promise.all(promises);
};
