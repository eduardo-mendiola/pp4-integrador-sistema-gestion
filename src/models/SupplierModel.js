import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact_name: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  address: { type: String, trim: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  collection: 'suppliers',
  timestamps: true
});

class SupplierModel extends BaseModel {
  constructor() {
    super(supplierSchema, 'Supplier');
  }
}

export default new SupplierModel();