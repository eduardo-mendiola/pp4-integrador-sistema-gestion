/**
 * Global Teardown for Jest Tests
 * 
 * Este archivo se ejecuta UNA VEZ después de TODOS los tests.
 * Detiene y limpia MongoDB Memory Server.
 * 
 * TDD Pattern: Cleanup de infraestructura después de todos los tests
 */

export default async function globalTeardown() {
  console.log('\nDeteniendo MongoDB Memory Server...\n');
  
  // Obtener referencia a MongoDB Memory Server
  const mongod = global.__MONGOD__;
  
  if (mongod) {
    // Detener el servidor
    await mongod.stop();
    console.log('MongoDB Memory Server detenido correctamente\n');
  }
}
