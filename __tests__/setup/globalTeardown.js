/**
 * Global Teardown for Jest Tests
 * 
 * Este archivo se ejecuta UNA VEZ después de TODOS los tests.
 * Detiene y limpia MongoDB Memory Server.
 */

export default async function globalTeardown() {
  console.log('\nDeteniendo MongoDB Memory ReplSet...\n');
  
  const mongod = global.__MONGOD__;
  
  if (mongod) {
    await mongod.stop();
    console.log('MongoDB Memory ReplSet detenido correctamente\n');
  }
}