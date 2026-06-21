/**
 * Builder Pattern for Test Data
 * Actualizado para las entidades principales del sistema
 */

import mongoose from 'mongoose';

/**
 * Builder para crear personas de prueba
 */
export class PersonBuilder {
  constructor() {
    this.person = {
      dni: `${Math.floor(Math.random() * 90000000) + 10000000}`,
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@test.com',
      phone: '1123456789',
      address: {
        street: 'Av. Siempre Viva',
        number: '123',
        neighborhood: 'Centro',
        city: 'Buenos Aires'
      }
    };
  }

  withDni(dni) {
    this.person.dni = dni;
    return this;
  }

  withName(firstName) {
    this.person.first_name = firstName;
    return this;
  }

  withLastName(lastName) {
    this.person.last_name = lastName;
    return this;
  }

  withEmail(email) {
    this.person.email = email;
    return this;
  }

  withPhone(phone) {
    this.person.phone = phone;
    return this;
  }

  withAddress(address) {
    this.person.address = address;
    return this;
  }

  withoutAddress() {
    this.person.address = null;
    return this;
  }

  build() {
    return { ...this.person };
  }

  buildWithout(...fields) {
    const person = { ...this.person };
    fields.forEach(field => delete person[field]);
    return person;
  }
}

/**
 * Builder para crear empleados de prueba
 * Incluye los nuevos campos de estado (status, contract_status)
 */
export class EmployeeBuilder {
  constructor() {
    this.employee = {
      employee_code: `EMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      person_id: new mongoose.Types.ObjectId(),
      hire_date: new Date('2024-01-15'),
      shift_schedule: 'full_time',
      status: 'active',
      status_reason: null,
      status_comments: null,
      contract_status: 'active',
      termination_date: null,
      termination_reason: null,
      termination_comments: null
    };
  }

  withPersonId(personId) {
    this.employee.person_id = personId;
    return this;
  }

  withHireDate(date) {
    this.employee.hire_date = date;
    return this;
  }

  withShiftSchedule(schedule) {
    this.employee.shift_schedule = schedule;
    return this;
  }

  // Métodos para estado del empleado
  active() {
    this.employee.status = 'active';
    this.employee.status_reason = null;
    this.employee.status_comments = null;
    return this;
  }

  inactive(reason, comments = null) {
    this.employee.status = 'inactive';
    this.employee.status_reason = reason;
    this.employee.status_comments = comments;
    return this;
  }

  // Métodos para estado del contrato
  contractActive() {
    this.employee.contract_status = 'active';
    this.employee.termination_date = null;
    this.employee.termination_reason = null;
    this.employee.termination_comments = null;
    return this;
  }

  contractTerminated(date, reason, comments = null) {
    this.employee.contract_status = 'terminated';
    this.employee.termination_date = date;
    this.employee.termination_reason = reason;
    this.employee.termination_comments = comments;
    return this;
  }

  build() {
    return { ...this.employee };
  }

  buildWithout(...fields) {
    const employee = { ...this.employee };
    fields.forEach(field => delete employee[field]);
    return employee;
  }
}

/**
 * Builder para crear ventas de prueba
 * Actualizado con la estructura real del modelo Sale
 */
export class SaleBuilder {
  constructor() {
    this.sale = {
      client_id: new mongoose.Types.ObjectId(),
      employee_id: new mongoose.Types.ObjectId(),
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 2,
          price: 1500,
          discount_rate: 0,
          discount: 0,
          subtotal: 3000
        }
      ],
      subtotal: 3000,
      discount_rate: 0,
      discount: 0,
      tax_rate: 21,
      tax: 630,
      total: 3630,
      payments: [
        {
          method: new mongoose.Types.ObjectId(),
          amount: 3630,
          reference: 'REF-001',
          status: 'CONFIRMED'
        }
      ],
      status: 'PAID',
      return_ids: [],
      has_returns: false,
      metadata: {}
    };
  }

  withClientId(clientId) {
    this.sale.client_id = clientId;
    return this;
  }

  withEmployeeId(employeeId) {
    this.sale.employee_id = employeeId;
    return this;
  }

  withItems(items) {
    this.sale.items = items;
    return this;
  }

  addItem(product, quantity, price, discountRate = 0) {
    const discount = (price * quantity * discountRate) / 100;
    const subtotal = (price * quantity) - discount;
    
    this.sale.items.push({
      product,
      quantity,
      price,
      discount_rate: discountRate,
      discount,
      subtotal
    });
    
    this.recalculateTotals();
    return this;
  }

  withSubtotal(subtotal) {
    this.sale.subtotal = subtotal;
    return this;
  }

  withDiscount(rate, amount) {
    this.sale.discount_rate = rate;
    this.sale.discount = amount;
    return this;
  }

  withTax(rate, amount) {
    this.sale.tax_rate = rate;
    this.sale.tax = amount;
    return this;
  }

  withTotal(total) {
    this.sale.total = total;
    return this;
  }

  withPayments(payments) {
    this.sale.payments = payments;
    return this;
  }

  addPayment(method, amount, reference = null, status = 'CONFIRMED') {
    this.sale.payments.push({
      method,
      amount,
      reference,
      status
    });
    return this;
  }

  pending() {
    this.sale.status = 'PENDING';
    return this;
  }

  paid() {
    this.sale.status = 'PAID';
    return this;
  }

  cancelled() {
    this.sale.status = 'CANCELLED';
    return this;
  }

  withReturns(returnIds) {
    this.sale.return_ids = returnIds;
    this.sale.has_returns = returnIds.length > 0;
    return this;
  }

  withMetadata(metadata) {
    this.sale.metadata = metadata;
    return this;
  }

  recalculateTotals() {
    this.sale.subtotal = this.sale.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.sale.discount = this.sale.subtotal * (this.sale.discount_rate / 100);
    const afterDiscount = this.sale.subtotal - this.sale.discount;
    this.sale.tax = afterDiscount * (this.sale.tax_rate / 100);
    this.sale.total = afterDiscount + this.sale.tax;
    return this;
  }

  build() {
    return { ...this.sale };
  }

  buildWithout(...fields) {
    const sale = { ...this.sale };
    fields.forEach(field => delete sale[field]);
    return sale;
  }
}

/**
 * Builder para crear productos de prueba
 */
export class ProductBuilder {
  constructor() {
    this.product = {
      name: 'Test Product',
      sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      category: new mongoose.Types.ObjectId(),
      supplier: new mongoose.Types.ObjectId(),
      age_range: '5-8',
      price: 1000,
      stock: 10,
      min_stock_alert: 2,
      metadata: {}
    };
  }

  withName(name) {
    this.product.name = name;
    return this;
  }

  withSku(sku) {
    this.product.sku = sku;
    return this;
  }

  withCategory(categoryId) {
    this.product.category = categoryId;
    return this;
  }

  withSupplier(supplierId) {
    this.product.supplier = supplierId;
    return this;
  }

  withAgeRange(range) {
    this.product.age_range = range;
    return this;
  }

  withPrice(price) {
    this.product.price = price;
    return this;
  }

  withStock(stock) {
    this.product.stock = stock;
    return this;
  }

  withMinStockAlert(value) {
    this.product.min_stock_alert = value;
    return this;
  }

  withMetadata(metadata) {
    this.product.metadata = metadata;
    return this;
  }

  build() {
    return { ...this.product };
  }

  buildWithout(...fields) {
    const product = { ...this.product };
    fields.forEach(field => delete product[field]);
    return product;
  }
}

/**
 * Builder para categorías
 */
export class CategoryBuilder {
  constructor() {
    this.category = {
      name: 'Test Category',
      description: 'Test category description'
    };
  }

  withName(name) {
    this.category.name = name;
    return this;
  }

  withDescription(desc) {
    this.category.description = desc;
    return this;
  }

  build() {
    return { ...this.category };
  }
}

/**
 * Builder para proveedores
 */
export class SupplierBuilder {
  constructor() {
    this.supplier = {
      name: 'Test Supplier',
      email: 'supplier@test.com',
      phone: '+54-11-0000-0000'
    };
  }

  withName(name) {
    this.supplier.name = name;
    return this;
  }

  withEmail(email) {
    this.supplier.email = email;
    return this;
  }

  withPhone(phone) {
    this.supplier.phone = phone;
    return this;
  }

  build() {
    return { ...this.supplier };
  }
}

/**
 * Builder para crear clientes de prueba
 */
export class ClientBuilder {
  constructor() {
    this.client = {
      client_code: `CLI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      document_type: 'DNI',
      document_number: `${Math.floor(Math.random() * 90000000) + 10000000}`,
      client_type: 'CONSUMIDOR_FINAL',
      first_name: 'María',
      last_name: 'González',
      email: 'maria.gonzalez@test.com',
      phone: '1198765432',
      address: {
        street: 'Calle Falsa',
        number: '456',
        city: 'Córdoba',
        state: 'Córdoba',
        postal_code: '5000',
        country: 'Argentina'
      },
      active: true
    };
  }

  withClientCode(code) {
    this.client.client_code = code;
    return this;
  }

  withDocumentType(type) {
    this.client.document_type = type;
    return this;
  }

  withDocumentNumber(number) {
    this.client.document_number = number;
    return this;
  }

  withClientType(type) {
    this.client.client_type = type;
    return this;
  }

  withName(firstName) {
    this.client.first_name = firstName;
    return this;
  }

  withLastName(lastName) {
    this.client.last_name = lastName;
    return this;
  }

  withEmail(email) {
    this.client.email = email;
    return this;
  }

  withPhone(phone) {
    this.client.phone = phone;
    return this;
  }

  withAddress(address) {
    this.client.address = address;
    return this;
  }

  withoutAddress() {
    this.client.address = null;
    return this;
  }

  active() {
    this.client.active = true;
    return this;
  }

  inactive() {
    this.client.active = false;
    return this;
  }

  build() {
    return { ...this.client };
  }

  buildWithout(...fields) {
    const client = { ...this.client };
    fields.forEach(field => delete client[field]);
    return client;
  }
}

/**
 * Builder para crear usuarios de prueba
 */
export class UserBuilder {
  constructor() {
    this.user = {
      code: `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      username: `user_${Math.random().toString(36).substring(2, 8)}`,
      password_hash: 'password123',
      email: `user_${Math.random().toString(36).substring(2, 8)}@test.com`,
      role_id: new mongoose.Types.ObjectId(),
      person_id: new mongoose.Types.ObjectId(),
      is_temporary_role: false,
      role_expiration_date: null,
      role_duration_value: null,
      role_duration_unit: 'days',
      fallback_role_id: null,
      last_login: null,
      is_active: true
    };
  }

  withCode(code) {
    this.user.code = code;
    return this;
  }

  withUsername(username) {
    this.user.username = username;
    return this;
  }

  withPassword(password) {
    this.user.password_hash = password;
    return this;
  }

  withEmail(email) {
    this.user.email = email;
    return this;
  }

  withRoleId(roleId) {
    this.user.role_id = roleId;
    return this;
  }

  withPersonId(personId) {
    this.user.person_id = personId;
    return this;
  }

  withTemporaryRole(expirationDate, fallbackRoleId) {
    this.user.is_temporary_role = true;
    this.user.role_expiration_date = expirationDate;
    this.user.fallback_role_id = fallbackRoleId;
    return this;
  }

  withLastLogin(date) {
    this.user.last_login = date;
    return this;
  }

  active() {
    this.user.is_active = true;
    return this;
  }

  inactive() {
    this.user.is_active = false;
    return this;
  }

  build() {
    return { ...this.user };
  }

  buildWithout(...fields) {
    const user = { ...this.user };
    fields.forEach(field => delete user[field]);
    return user;
  }
}

/**
 * Builder para crear métodos de pago de prueba
 */
export class PaymentMethodBuilder {
  constructor() {
    this.paymentMethod = {
      name: 'Efectivo',
      requires_auth: false,
      allows_installments: false,
      active: true,
      surcharge_percentage: 0
    };
  }

  withName(name) {
    this.paymentMethod.name = name;
    return this;
  }

  requiresAuth() {
    this.paymentMethod.requires_auth = true;
    return this;
  }

  allowsInstallments() {
    this.paymentMethod.allows_installments = true;
    return this;
  }

  withSurcharge(percentage) {
    this.paymentMethod.surcharge_percentage = percentage;
    return this;
  }

  active() {
    this.paymentMethod.active = true;
    return this;
  }

  inactive() {
    this.paymentMethod.active = false;
    return this;
  }

  build() {
    return { ...this.paymentMethod };
  }
}