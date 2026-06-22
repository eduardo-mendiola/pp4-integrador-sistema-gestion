import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  postal_code: { type: String, trim: true },
  country: { type: String, trim: true, default: 'Argentina' }
}, { _id: false });

const clientSchema = new mongoose.Schema({
  client_code: { type: String, unique: true, required: true, trim: true },
  document_type: { type: String, enum: ['DNI', 'CUIT', 'CUIL', 'PASAPORTE', 'CDI', 'LC'], required: true },
  document_number: { type: String, required: true, trim: true },
  client_type: {
    type: String,
    enum: [
      'CONSUMIDOR_FINAL',
      'RESPONSABLE_INSCRIPTO',
      'MONOTRIBUTISTA',
      'EXENTO'
    ],
    default: 'CONSUMIDOR_FINAL'
  },
  business_name: { type: String, trim: true},
  first_name: { type: String, trim: true },
  last_name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: addressSchema,
  active: { type: Boolean, default: true }

}, {
  collection: 'clients',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Historial de compras del cliente
clientSchema.virtual('purchases', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'client_id'
});

// Nombre completo
clientSchema.virtual('full_name').get(function () {
  return `${this.first_name || ''} ${this.last_name || ''}`.trim();
});

mongoose.models.Client || mongoose.model('Client', clientSchema);

class ClientModel extends BaseModel {
  constructor() {
    super(clientSchema, 'Client');
  }

  async findAll() {
    return await super.findAll([
      {
        path: 'purchases',
        populate: [
          {
            path: 'employee_id',
            select: 'username code'
          },
          {
            path: 'items.product',
            select: 'name sku precio_venta'
          }
        ]
      }
    ]);
  }

  async findById(id) {
    return await super.findById(id, [
      {
        path: 'purchases',
        populate: [
          {
            path: 'employee_id',
            select: 'username code'
          },
          {
            path: 'items.product',
            select: 'name sku precio_venta'
          }
        ]
      }
    ]);
  }
}

export default new ClientModel();