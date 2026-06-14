import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  discount_rate: { type: Number, default: 0 }, 
  discount: { type: Number, default: 0 },      
  subtotal: { type: Number, required: true }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: { type: [saleItemSchema], required: true },
  
  subtotal: { type: Number, required: true, default: 0 },
  discount_rate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax_rate: { type: Number, default: 21 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },

  payments: [{
    method: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
    amount: { type: Number, required: true },
    reference: String,
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'REJECTED'], default: 'CONFIRMED' }
  }],

  status: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PAID' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  collection: 'sales',
  timestamps: true
});

const Sale = mongoose.model('Sale', saleSchema);

class SaleModel extends BaseModel {
  constructor() {
    super(saleSchema, 'Sale');
  }

  findAll() {
    return super.findAll([
      { path: 'items.product' },
      { path: 'client_id' },
      { path: 'employee_id' },
      { path: 'payments.method' }
    ]);
  }

  findById(id) {
    return super.findById(id, [
      { path: 'items.product' },
      { path: 'client_id' },
      { path: 'employee_id' },
      { path: 'payments.method' }
    ]);
  }
}

export default new SaleModel();