/**
 * Integration Tests - Sales API (CRUD completo)
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

import Sale from '../../src/models/SaleModel.js';
import Client from '../../src/models/ClientModel.js';
import Product from '../../src/models/ProductModel.js';
import Category from '../../src/models/CategoryModel.js';
import Supplier from '../../src/models/SupplierModel.js';
import User from '../../src/models/UserModel.js';
import Role from '../../src/models/RoleModel.js';
import Person from '../../src/models/PersonModel.js';
import PaymentMethod from '../../src/models/PaymentMethodModel.js';
import CashRegister from '../../src/models/CashRegisterModel.js';

describe('Integration Tests - Sales API', () => {

  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  describe('POST /api/sales - Crear venta', () => {

    let testClient;
    let testProduct1;
    let testProduct2;
    let testProduct3;
    let testUser;
    let testPaymentMethod;

    beforeEach(async () => {
      // Crear datos base necesarias
      const role = await Role.create({ 
        name: 'TEST_Vendedor', 
        permissions: ['create_sales'] 
      });

      const person = await Person.create({
        dni: 'TEST-DNI-99999999',
        first_name: 'TEST_Vendedor',
        last_name: 'TEST'
      });

      testUser = await User.create({
        username: 'test_vendedor',
        email: 'test.vendedor@test-only.com',
        password_hash: 'password123',
        role_id: role._id,
        person_id: person._id
      });

      testClient = await Client.create({
        client_code: 'TEST-CLI-001',
        document_type: 'DNI',
        document_number: 'TEST-12345678',
        first_name: 'TEST_Cliente',
        last_name: 'TEST'
      });

      // Crear categorías y proveedores
      const category1 = await Category.create({
        name: 'TEST_Juguetes'
      });

      const supplier1 = await Supplier.create({
        supplier_code: 'TEST-SUP-001',
        name: 'TEST_Proveedor1'
      });

      // Crear productos SIN especificar _id (usar IDs generados automáticamente)
      testProduct1 = await Product.create({
        name: 'TEST_Osito de Peluche Grande',
        sku: 'TEST-JUG-008',
        category: category1._id,
        supplier: supplier1._id,
        age_range: '0-2',
        price: 14500,
        stock: 5,
        min_stock_alert: 2
      });

      testProduct2 = await Product.create({
        name: 'TEST_Producto2',
        sku: 'TEST-PROD-002',
        category: category1._id,
        supplier: supplier1._id,
        price: 500,
        stock: 10,
        min_stock_alert: 2
      });

      testProduct3 = await Product.create({
        name: 'TEST_Producto3',
        sku: 'TEST-PROD-003',
        category: category1._id,
        supplier: supplier1._id,
        price: 750,
        stock: 8,
        min_stock_alert: 2
      });

      testPaymentMethod = await PaymentMethod.create({
        name: 'TEST_Efectivo',
        requires_auth: false,
        allows_installments: false
      });

      // Crear caja abierta
      await CashRegister.create({
        name: 'TEST_Caja',
        status: 'OPEN',
        openingDate: new Date(),
        initialAmount: 0,
        openedBy: testUser._id
      });
    });

    it('debe crear una venta correctamente', async () => {
      
      // Arrange - Usar IDs de los productos creados
      const payload = {
        client_id: testClient._id.toString(),
        employee_id: testUser._id.toString(),
        items: [
          {
            productId: testProduct1._id.toString(), // Usar ID generado
            quantity: 2,
            price: 14500,
            discount_rate: 0,
            discount: 0,
            subtotal: 29000
          }
        ],
        subtotal: 29000,
        discount_rate: 0,
        discount: 0,
        tax_rate: 21,
        tax: 6090,
        total: 35090,
        payments: [
          {
            method: testPaymentMethod._id.toString(),
            amount: 35090,
            status: 'CONFIRMED'
          }
        ],
        status: 'PAID'
      };

      // Act
      const response = await request(app)
        .post('/api/sales')
        .send(payload);


      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.total).toBe(35090);
      expect(response.body.data.status).toBe('PAID');
    });

    it('debe crear venta con múltiples items', async () => {
      
      // Arrange - Usar IDs de los productos creados
      const payload = {
        client_id: testClient._id.toString(),
        employee_id: testUser._id.toString(),
        items: [
          {
            productId: testProduct1._id.toString(), // Usar ID generado
            quantity: 1,
            price: 14500,
            discount_rate: 0,
            discount: 0,
            subtotal: 14500
          },
          {
            productId: testProduct2._id.toString(), // Usar ID generado
            quantity: 3,
            price: 500,
            discount_rate: 10,
            discount: 150,
            subtotal: 1350
          }
        ],
        subtotal: 15850,
        discount_rate: 0,
        discount: 0,
        tax_rate: 21,
        tax: 3328.5,
        total: 19178.5,
        payments: [
          {
            method: testPaymentMethod._id.toString(),
            amount: 19178.5,
            status: 'CONFIRMED'
          }
        ],
        status: 'PAID'
      };

      // Act
      const response = await request(app)
        .post('/api/sales')
        .send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.items.length).toBe(2);
      expect(response.body.data.total).toBe(19178.5);
    });

    it('debe fallar si falta client_id', async () => {
      // Arrange
      const payload = {
        employee_id: testUser._id.toString(),
        items: [
          {
            product: testProduct1._id.toString(),
            quantity: 1,
            price: 14500,
            subtotal: 14500
          }
        ],
        total: 14500
      };

      // Act
      const response = await request(app)
        .post('/api/sales')
        .send(payload);

      // Assert
      expect(response.status).toBe(400);
    });

    it('debe fallar si falta employee_id', async () => {
      // Arrange
      const payload = {
        client_id: testClient._id.toString(),
        items: [
          {
            product: testProduct1._id.toString(),
            quantity: 1,
            price: 14500,
            subtotal: 14500
          }
        ],
        total: 14500
      };

      // Act
      const response = await request(app)
        .post('/api/sales')
        .send(payload);

      // Assert
      expect(response.status).toBe(400);
    });

    it('debe permitir crear venta con items vacío', async () => {
      // Arrange
      const payload = {
        client_id: testClient._id.toString(),
        employee_id: testUser._id.toString(),
        items: [],
        total: 0
      };

      // Act
      const response = await request(app)
        .post('/api/sales')
        .send(payload);

      // Assert - El backend permite items vacíos
      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/sales - Obtener ventas', () => {

    it('debe retornar lista vacía si no hay ventas', async () => {
      // Act
      const response = await request(app)
        .get('/api/sales');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('debe retornar venta por ID con relaciones populadas', async () => {
      // Arrange - Crear datos específicos para este test
      const role = await Role.create({ name: 'TEST_Vendedor_GET', permissions: [] });
      const person = await Person.create({
        dni: 'TEST-DNI-88888888',
        first_name: 'TEST_Get',
        last_name: 'TEST_User'
      });
      const user = await User.create({
        username: 'test_user_get',
        email: 'test.get@test-only.com',
        password_hash: 'pass123',
        role_id: role._id,
        person_id: person._id
      });

      const client = await Client.create({
        client_code: 'TEST-CLI-002',
        document_type: 'DNI',
        document_number: 'TEST-87654321',
        first_name: 'TEST_Cliente',
        last_name: 'TEST'
      });

      const category = await Category.create({ name: 'TEST_Cat_GET' });
      const supplier = await Supplier.create({ 
        supplier_code: 'TEST-SUP-GET',
        name: 'TEST_Sup_GET' 
      });
      const product = await Product.create({
        name: 'TEST_Producto_GET',
        category: category._id,
        supplier: supplier._id,
        price: 1000,
        stock: 10
      });

      const paymentMethod = await PaymentMethod.create({
        name: 'TEST_Efectivo_GET'
      });

      const sale = await Sale.create({
        client_id: client._id,
        employee_id: user._id,
        items: [{
          product: product._id,
          quantity: 1,
          price: 1000,
          subtotal: 1000
        }],
        subtotal: 1000,
        total: 1210,
        payments: [{
          method: paymentMethod._id,
          amount: 1210,
          status: 'CONFIRMED'
        }],
        status: 'PAID'
      });

      // Act
      const response = await request(app)
        .get(`/api/sales/${sale._id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data._id.toString()).toBe(sale._id.toString());
      expect(response.body.data.client_id).toHaveProperty('first_name');
      expect(response.body.data.items[0].product).toHaveProperty('name');
    });
  });

  describe('PATCH /api/sales/:id - Actualizar venta', () => {

    it('debe actualizar estado de venta', async () => {
      // Arrange
      const role = await Role.create({ name: 'TEST_Vendedor_PATCH', permissions: [] });
      const person = await Person.create({
        dni: 'TEST-DNI-77777777',
        first_name: 'TEST_Patch',
        last_name: 'TEST_User'
      });
      const user = await User.create({
        username: 'test_user_patch',
        email: 'test.patch@test-only.com',
        password_hash: 'pass123',
        role_id: role._id,
        person_id: person._id
      });

      const client = await Client.create({
        client_code: 'TEST-CLI-003',
        document_type: 'DNI',
        document_number: 'TEST-11111111',
        first_name: 'TEST_Cliente',
        last_name: 'TEST'
      });

      const category = await Category.create({ name: 'TEST_Cat_PATCH' });
      const supplier = await Supplier.create({ 
        supplier_code: 'TEST-SUP-PATCH',
        name: 'TEST_Sup_PATCH' 
      });
      const product = await Product.create({
        name: 'TEST_Producto_PATCH',
        category: category._id,
        supplier: supplier._id,
        price: 1000,
        stock: 10
      });

      const paymentMethod = await PaymentMethod.create({
        name: 'TEST_Efectivo_PATCH'
      });

      const sale = await Sale.create({
        client_id: client._id,
        employee_id: user._id,
        items: [{
          product: product._id,
          quantity: 1,
          price: 1000,
          subtotal: 1000
        }],
        subtotal: 1000,
        total: 1210,
        payments: [{
          method: paymentMethod._id,
          amount: 1210,
          status: 'CONFIRMED'
        }],
        status: 'PAID'
      });

      // Act
      const response = await request(app)
        .patch(`/api/sales/${sale._id}`)
        .send({ status: 'CANCELLED' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CANCELLED');
    });
  });

  describe('DELETE /api/sales/:id - Eliminar venta', () => {

    it('debe eliminar venta existente', async () => {
      // Arrange
      const role = await Role.create({ name: 'TEST_Vendedor_DELETE', permissions: [] });
      const person = await Person.create({
        dni: 'TEST-DNI-66666666',
        first_name: 'TEST_Delete',
        last_name: 'TEST_User'
      });
      const user = await User.create({
        username: 'test_user_delete',
        email: 'test.delete@test-only.com',
        password_hash: 'pass123',
        role_id: role._id,
        person_id: person._id
      });

      const client = await Client.create({
        client_code: 'TEST-CLI-004',
        document_type: 'DNI',
        document_number: 'TEST-22222222',
        first_name: 'TEST_Cliente',
        last_name: 'TEST'
      });

      const category = await Category.create({ name: 'TEST_Cat_DELETE' });
      const supplier = await Supplier.create({ 
        supplier_code: 'TEST-SUP-DELETE',
        name: 'TEST_Sup_DELETE' 
      });
      const product = await Product.create({
        name: 'TEST_Producto_DELETE',
        category: category._id,
        supplier: supplier._id,
        price: 1000,
        stock: 10
      });

      const paymentMethod = await PaymentMethod.create({
        name: 'TEST_Efectivo_DELETE'
      });

      const sale = await Sale.create({
        client_id: client._id,
        employee_id: user._id,
        items: [{
          product: product._id,
          quantity: 1,
          price: 1000,
          subtotal: 1000
        }],
        subtotal: 1000,
        total: 1210,
        payments: [{
          method: paymentMethod._id,
          amount: 1210,
          status: 'CONFIRMED'
        }],
        status: 'PAID'
      });

      // Act
      const response = await request(app)
        .delete(`/api/sales/${sale._id}`);

      // Assert
      expect(response.status).toBe(200);
      
      const deleted = await Sale.findById(sale._id);
      expect(deleted).toBeNull();
    });
  });
});