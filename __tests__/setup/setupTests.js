/**
 * Setup Tests - Configuración para cada archivo de test
 * 
 * Se ejecuta ANTES de cada archivo de test.
 * Configura timeouts, mocks globales y utilidades.
 * 
 * TDD Pattern: Configuración común para mantener tests DRY
 */

// Establecer NODE_ENV para activar bypass de autenticación
process.env.NODE_ENV = 'test';

// Nota: jest no está disponible como global en ES modules
// Los timeouts se configuran en jest.config.js

// Configuración global para mantener tests consistentes
beforeAll(() => {
  // Cualquier configuración necesaria antes de todos los tests
});

afterAll(() => {
  // Limpieza después de todos los tests
});

// Limpiar mocks antes de cada test
beforeEach(() => {
  // jest.clearAllMocks se llama manualmente en cada test
});

afterEach(() => {
  // Limpieza adicional si es necesaria
});

// Helpers globales para assertions comunes
global.expectValidMongoId = (id) => {
  expect(id).toBeDefined();
  expect(typeof id).toBe('string');
  expect(id).toMatch(/^[a-f\d]{24}$/i);
};

global.expectValidTimestamp = (timestamp) => {
  expect(timestamp).toBeDefined();
  expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
};
