import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

// Schema for payment methods (e.g., cash, credit card, etc.)
const paymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  requires_auth: { type: Boolean, default: false },
  allows_installments: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  surcharge_percentage: { type: Number, default: 0 }
}, {
  collection: 'payment_methods',
  timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

class PaymentMethodModel extends BaseModel {
  constructor() {
    super(paymentMethodSchema, 'PaymentMethod');
  }
}

export default new PaymentMethodModel();