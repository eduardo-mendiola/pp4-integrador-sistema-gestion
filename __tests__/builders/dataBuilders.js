/**
 * Builder Pattern for Test Data
 */

import mongoose from 'mongoose';

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
 * Builder para crear ventas (sales)
 */
export class SaleBuilder {
  constructor() {
    this.sale = {
      product_id: new mongoose.Types.ObjectId(),
      quantity: 1,
      unit_price: 1000,
      total: 1000,
      status: 'pending',
      sale_date: new Date()
    };
  }

  withProduct(productId) {
    this.sale.product_id = productId;
    return this;
  }

  withQuantity(quantity) {
    this.sale.quantity = quantity;
    this.sale.total = quantity * this.sale.unit_price;
    return this;
  }

  withUnitPrice(price) {
    this.sale.unit_price = price;
    this.sale.total = this.sale.quantity * price;
    return this;
  }

  pending() {
    this.sale.status = 'pending';
    return this;
  }

  completed() {
    this.sale.status = 'completed';
    return this;
  }

  cancelled() {
    this.sale.status = 'cancelled';
    return this;
  }

  withSaleDate(date) {
    this.sale.sale_date = date;
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
