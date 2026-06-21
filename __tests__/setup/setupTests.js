/**
 * Setup Tests - Configuración para cada archivo de test
 * 
 * Se ejecuta ANTES de cada archivo de test.
 */

process.env.NODE_ENV = 'test';

beforeAll(() => {});

afterAll(() => {});

beforeEach(() => {});

afterEach(() => {});

global.expectValidMongoId = (id) => {
  expect(id).toBeDefined();
  expect(typeof id).toBe('string');
  expect(id).toMatch(/^[a-f\d]{24}$/i);
};

global.expectValidTimestamp = (timestamp) => {
  expect(timestamp).toBeDefined();
  expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
};