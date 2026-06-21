/**
 * Global Setup for Jest Tests
 * 
 * Este archivo se ejecuta UNA VEZ antes de TODOS los tests.
 * Inicializa MongoDB Memory Server para testing aislado.
 * 
 * IMPORTANTE: Usamos MongoMemoryReplSet en lugar de MongoMemoryServer
 * porque necesitamos soporte para transacciones (session.startTransaction)
 */

import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function globalSetup() {
  console.log('\nIniciando MongoDB Memory ReplSet (con soporte para transacciones)...\n');
  
  // Crear instancia de MongoDB Replica Set en memoria
  // MongoMemoryReplSet SÍ soporta transacciones
  const mongod = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      dbName: 'test_database',
      storageEngine: 'wiredTiger'
    }
  });

  const uri = mongod.getUri();
  
  global.__MONGOD__ = mongod;
  global.__MONGO_URI__ = uri;
  process.env.MONGO_URI_TEST = uri;
  
  console.log(`MongoDB Memory ReplSet iniciado en: ${uri}\n`);
}