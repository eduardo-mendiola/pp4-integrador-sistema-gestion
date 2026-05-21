/**
 * Integration Tests - Products API (GET, PUT, DELETE)
 *
 * TDD Pattern: Red → Green → Refactor
 *
 * Tests para operaciones de lectura, actualización y eliminación
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

describe('Integration Tests - GET /api/products', () => {

  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  describe('GET /api/products - obtener todos', () => {

    it('debe retornar lista vacía si no hay productos', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('debe retornar todos los productos', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      await Product.create({
        name: 'Producto 1',
        category: category._id,
        supplier: supplier._id,
        price: 100
      });

      await Product.create({
        name: 'Producto 2',
        category: category._id,
        supplier: supplier._id,
        price: 200
      });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.length).toBe(2);

      response.body.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('supplier');
      });
    });

    it('debe incluir category y supplier populados', async () => {
      const category = await Category.create({ name: 'Educativos' });
      const supplier = await Supplier.create({ name: 'Toy SA' });

      await Product.create({
        name: 'Rompecabezas',
        category: category._id,
        supplier: supplier._id
      });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body[0].category).toHaveProperty('name', 'Educativos');
      expect(response.body[0].supplier).toHaveProperty('name', 'Toy SA');
    });
  });

  describe('GET /api/products/:id', () => {

    it('debe retornar producto por ID', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const product = await Product.create({
        name: 'Producto específico',
        category: category._id,
        supplier: supplier._id
      });

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.id).toBe(product._id.toString());
      expect(response.body.name).toBe('Producto específico');
    });

    it('debe retornar 404 si no existe', async () => {
      const id = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/products/${id}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('debe manejar ID inválido', async () => {
      const response = await request(app)
        .get('/api/products/invalid_id')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
});

describe('Integration Tests - PUT /api/products/:id', () => {

  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  describe('Actualizar producto', () => {

    it('debe actualizar el nombre del producto', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const product = await Product.create({
        name: 'Original',
        category: category._id,
        supplier: supplier._id
      });

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ name: 'Actualizado' })
        .expect(200);

      expect(response.body.name).toBe('Actualizado');
    });

    it('debe actualizar precio y stock', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const product = await Product.create({
        name: 'Producto',
        category: category._id,
        supplier: supplier._id,
        price: 100,
        stock: 10
      });

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ price: 250, stock: 5 })
        .expect(200);

      expect(response.body.price).toBe(250);
      expect(response.body.stock).toBe(5);
    });

    it('debe retornar 404 si no existe', async () => {
      const response = await request(app)
        .put('/api/products/507f1f77bcf86cd799439011')
        .send({ name: 'X' })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('debe rechazar status inválido si existe regla de enum', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const product = await Product.create({
        name: 'Producto',
        category: category._id,
        supplier: supplier._id
      });

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ status: 'invalid_status' })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
});

describe('Integration Tests - DELETE /api/products/:id', () => {

  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  describe('Eliminar producto', () => {

    it('debe eliminar producto existente', async () => {
      const category = await Category.create({ name: 'Juguetes' });
      const supplier = await Supplier.create({ name: 'Proveedor' });

      const product = await Product.create({
        name: 'Eliminarme',
        category: category._id,
        supplier: supplier._id
      });

      await request(app)
        .delete(`/api/products/${product._id}`)
        .expect(204);

      const deleted = await Product.findById(product._id);
      expect(deleted).toBeNull();
    });

    it('debe retornar 404 si no existe', async () => {
      const response = await request(app)
        .delete('/api/products/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('debe manejar ID inválido', async () => {
      const response = await request(app)
        .delete('/api/products/invalid_id')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
});
