/**
 * Global Setup for Jest Tests
 * 
 * Este archivo se ejecuta UNA VEZ antes de TODOS los tests.
 * Inicializa MongoDB Memory Server para testing aislado.
 * 
 * TDD Pattern: Setup de infraestructura antes de escribir tests
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function globalSetup() {
  console.log('\nIniciando MongoDB Memory Server...\n');
  
  // Crear instancia de MongoDB en memoria
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'test_database',
      port: 27018 // Puerto diferente al de desarrollo
    }
  });

  // Obtener URI de conexión
  const uri = mongod.getUri();
  
  // Guardar URI y referencia de mongod en variables globales
  // para que estén disponibles en los tests
  global.__MONGOD__ = mongod;
  global.__MONGO_URI__ = uri;
  
  // También guardamos en variable de entorno para facilitar acceso
  process.env.MONGO_URI_TEST = uri;
  
  console.log(`MongoDB Memory Server iniciado en: ${uri}\n`);
}
