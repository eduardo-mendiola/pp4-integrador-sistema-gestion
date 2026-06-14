import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const returnItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  discount_rate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true }
}, { _id: false });

const returnSchema = new mongoose.Schema({
  original_sale_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  replacement_sale_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null }, // Solo en caso de cambio
  
  type: { 
    type: String, 
    enum: ['RETURN', 'EXCHANGE_SAME', 'EXCHANGE_OTHER', 'CREDIT_NOTE'], 
    required: true 
  },
  
  reason: { type: String, required: true },
  reason_custom: { type: String, default: '' }, // Si el motivo es "otro"
  
  items: { type: [returnItemSchema], required: true },
  
  // Montos de la devolución
  subtotal: { type: Number, required: true, default: 0 },
  discount_rate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax_rate: { type: Number, default: 21 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // En caso de cambio con diferencia
  exchange_items: [{ type: mongoose.Schema.Types.Mixed }], // Items nuevos en caso de cambio
  exchange_total: { type: Number, default: 0 },
  difference: { type: Number, default: 0 }, // Positivo: cliente paga. Negativo: comercio devuelve
  
  // Método de devolución/pago de diferencia
  payment_method: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
  payment_reference: { type: String },
  
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: { 
    type: String, 
    enum: ['COMPLETED', 'CANCELLED'], 
    default: 'COMPLETED' 
  },
  
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  collection: 'returns',
  timestamps: true
});

const Return = mongoose.model('Return', returnSchema);

class ReturnModel extends BaseModel {
  constructor() {
    super(returnSchema, 'Return');
  }

  findAll() {
    return super.findAll([
      { path: 'original_sale_id' },
      { path: 'replacement_sale_id' },
      { path: 'items.product' },
      { path: 'employee_id' },
      { path: 'payment_method' }
    ]);
  }

  findById(id) {
    return super.findById(id, [
      { path: 'original_sale_id' },
      { path: 'replacement_sale_id' },
      { path: 'items.product' },
      { path: 'employee_id' },
      { path: 'payment_method' }
    ]);
  }
}

export default new ReturnModel();