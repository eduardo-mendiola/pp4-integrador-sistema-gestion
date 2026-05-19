import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  items: { type: [saleItemSchema], required: true },
  total: { type: Number, required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
    return super.findAll(['items.product', 'created_by']);
  }

  findById(id) {
    return super.findById(id, ['items.product', 'created_by']);
  }
}

export default new SaleModel();