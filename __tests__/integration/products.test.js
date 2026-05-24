/**
 * Integration Tests - Products API
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

import Product from '../../src/models/ProductModel.js';
import Category from '../../src/models/CategoryModel.js';
import Supplier from '../../src/models/SupplierModel.js';

describe('Integration Tests - POST /api/products', () => {

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  /**
   * Crear producto válido
   */
  describe('Crear producto con datos válidos', () => {

    it('debe crear un producto correctamente (201)', async () => {
      // Arrange
      const category = await Category.create({ name: 'Juguetes educativos' });
      const supplier = await Supplier.create({ name: 'Toy Supplier SA' });

      const payload = {
        name: 'Rompecabezas 100 piezas',
        category: category._id,
        supplier: supplier._id,
        price: 1500,
        stock: 20,
        min_stock_alert: 5,
        age_range: '5-8'
      };

      // Act
      const response = await request(app)
        .post('/api/products')
        .send(payload)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Rompecabezas 100 piezas');
      expect(response.body.price).toBe(1500);
      expect(response.body.stock).toBe(20);

      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    it('debe generar SKU automáticamente si no se envía', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor 1' });

      const payload = {
        name: 'Auto sin SKU',
        category: category._id,
        supplier: supplier._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('sku');
      expect(typeof response.body.sku).toBe('string');
    });
  });

  /**
   * Validaciones obligatorias
   */
  describe('Validación de campos requeridos', () => {

    it('debe fallar si falta name', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const payload = {
        category: category._id,
        supplier: supplier._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('debe fallar si falta category', async () => {
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const payload = {
        name: 'Producto sin categoría',
        supplier: supplier._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('debe fallar si falta supplier', async () => {
      const category = await Category.create({ name: 'Juguetes' });

      const payload = {
        name: 'Producto sin proveedor',
        category: category._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload);

      expect(response.status).toBe(400);
    });
  });

  /**
   * Validación de referencias
   */
  describe('Validación de referencias inválidas', () => {

    it('debe rechazar category inválida', async () => {
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const payload = {
        name: 'Test',
        category: 'invalid_id',
        supplier: supplier._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('debe rechazar supplier inválido', async () => {
      const category = await Category.create({ name: 'Juguetes' });

      const payload = {
        name: 'Test',
        category: category._id,
        supplier: 'invalid_id'
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload);

      expect(response.status).toBe(400);
    });
  });

  /**
   * Campos opcionales
   */
  describe('Campos opcionales', () => {

    it('debe permitir crear producto sin age_range', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const payload = {
        name: 'Producto sin edad',
        category: category._id,
        supplier: supplier._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload)
        .expect(201);

      expect(response.body.age_range).toBeUndefined();
    });

    it('debe usar valores por defecto en stock y price', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const payload = {
        name: 'Producto básico',
        category: category._id,
        supplier: supplier._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(payload)
        .expect(201);

      expect(response.body.price).toBe(0);
      expect(response.body.stock).toBe(0);
    });
  });

  /**
   * TODO FUTURO (juguetería)
   *
   * - Validar stock mínimo y alertas automáticas
   * - Reglas de edad por categoría
   * - SKU único global
   * - Integración con reposición automática
   * - Control de inventario por proveedor
   */
});
