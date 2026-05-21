/**
 * Jest Configuration for ES Modules
 * 
 * Configuración principal de Jest para testing de API RESTful
 * con soporte para ES modules, MongoDB Memory Server y coverage
 */

export default {
  // Indicar que usamos ES modules
  testEnvironment: 'node',
  
  // Extensiones de archivos a considerar
  moduleFileExtensions: ['js', 'json'],
  
  // Patrón para encontrar archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/setup/',
    '/__tests__/helpers/',
    '/__tests__/builders/',
    '/__tests__/fixtures/'
  ],
  
  // Setup y teardown globales
  globalSetup: './__tests__/setup/globalSetup.js',
  globalTeardown: './__tests__/setup/globalTeardown.js',
  
  // Setup para cada archivo de test
  setupFilesAfterEnv: ['./__tests__/setup/setupTests.js'],
  
  // Transformaciones (ninguna para ES modules nativos)
  transform: {},
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  
  coverageDirectory: 'coverage',
  
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Umbrales de coverage (opcional, ajustar según proyecto)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Timeout para tests (útil para tests de integración)
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Detectar archivos abiertos
  detectOpenHandles: true,
  
  // Forzar salida después de tests
  forceExit: true,
  
  // Ejecutar tests en secuencia (importante para tests de DB)
  maxWorkers: 1
};
