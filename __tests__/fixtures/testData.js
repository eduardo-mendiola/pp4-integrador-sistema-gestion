/**
 * Fixtures - Datos de prueba reutilizables.
 * 
 * TODO:
 * Reescribir completamente cuando se estabilice el modelo de dominio
 * (Product / Sale / Inventory System).
 * 
 * - Separar fixtures por módulo (products, sales, categories, suppliers)
 * - Eliminar IDs hardcodeados en favor de factories dinámicas
 * - Migrar a builders consistentes (ProductBuilder, SaleBuilder)
 * - Revisar enums (status, stock_state, sale_status)
 */

import mongoose from 'mongoose';

/**
 * IDs fijos para tests
 * TODO: eliminar en favor de factories dinámicas por entorno
 */
export const FIXTURE_IDS = {
  product1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
  product2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),

  category1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
  category2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),

  supplier1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
  supplier2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),

  sale1: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
  sale2: new mongoose.Types.ObjectId('507f1f77bcf86cd799439042')
};

/**
 * Product fixture base válido
 */
export const VALID_PRODUCT = {
  name: 'Juguete Educativo',
  sku: 'PRD-TEST-001',
  category: FIXTURE_IDS.category1,
  supplier: FIXTURE_IDS.supplier1,
  age_range: '5-8',
  price: 1500,
  stock: 20,
  min_stock_alert: 5
};

/**
 * Sale fixture base (ventas)
 * TODO: definir estructura final del módulo sales
 */
export const VALID_SALE = {
  // TODO: definir campos finales cuando se implemente módulo de ventas
  // Ejemplo esperado:
  // product_id,
  // quantity,
  // unit_price,
  // total,
  // payment_method,
  // status

  product_id: FIXTURE_IDS.product1,
  quantity: 2,
  unit_price: 1500,
  total: 3000,
  status: 'completed'
};

/**
 * Datos válidos de categoría
 */
export const VALID_CATEGORY = {
  name: 'Juguetes Educativos',
  description: 'Juguetes para desarrollo cognitivo'
};

/**
 * Datos válidos de proveedor
 */
export const VALID_SUPPLIER = {
  name: 'Proveedor Juguetes SA',
  email: 'contact@supplier.com',
  phone: '+54-11-5555-0000'
};

/**
 * Datos inválidos (validaciones de Product)
 */
export const INVALID_PRODUCTS = {
  missingName: {
    category: FIXTURE_IDS.category1,
    supplier: FIXTURE_IDS.supplier1,
    price: 100
  },

  missingCategory: {
    name: 'Producto sin categoría',
    supplier: FIXTURE_IDS.supplier1
  },

  missingSupplier: {
    name: 'Producto sin proveedor',
    category: FIXTURE_IDS.category1
  },

  invalidPrice: {
    name: 'Producto inválido',
    category: FIXTURE_IDS.category1,
    supplier: FIXTURE_IDS.supplier1,
    price: -100
  },

  invalidStock: {
    name: 'Stock inválido',
    category: FIXTURE_IDS.category1,
    supplier: FIXTURE_IDS.supplier1,
    stock: -5
  }
};

/**
 * Mensajes de error esperados
 * TODO: unificar con capa global de errores (API error handler)
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field) => `${field} es requerido`,
  INVALID_ENUM: (field, value) => `${value} no es válido para ${field}`,
  INVALID_ID: 'ID inválido',
  NOT_FOUND: 'No encontrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado'
};
