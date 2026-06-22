import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

// Define the Supplier schema
const supplierSchema = new mongoose.Schema({
  supplier_code: { type: String, unique: true, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  contact_name: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  address: { type: String, trim: true },
  status: { type: String, enum: ['ACTIVO', 'SUSPENDIDO', 'CANCELADO'], default: 'ACTIVO' },
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