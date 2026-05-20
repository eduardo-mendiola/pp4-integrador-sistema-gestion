import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const saleItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },

  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },

  price: { 
    type: Number, 
    required: true 
  },

  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({

  // Venta → Cliente (diagrama)
  client_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },

  // Venta → Empleado (diagrama)
  employee_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // o Employee si lo separas después
    required: true 
  },

  // DetalleVenta (composición)
  items: { 
    type: [saleItemSchema], 
    required: true 
  },

  total: { 
    type: Number, 
    required: true 
  },

  payment_method: {
    type: String,
    default: 'CASH'
  },

  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'CANCELLED'],
    default: 'PAID'
  },

  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  }

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
      { path: 'employee_id' }
    ]);
  }

  findById(id) {
    return super.findById(id, [
      { path: 'items.product' },
      { path: 'client_id' },
      { path: 'employee_id' }
    ]);
  }
}

export default new SaleModel();