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
  code: { type: String, unique: true, required: true, trim: true },
  tipo_documento: { type: String, enum: ['DNI', 'CUIT', 'CUIL', 'PASAPORTE', 'CDI', 'LC'], required: true },
  nro_documento: { type: String, required: true, trim: true },
  tipo_cliente: {
    type: String,
    enum: [
      'CONSUMIDOR_FINAL',
      'RESPONSABLE_INSCRIPTO',
      'MONOTRIBUTISTA',
      'EXENTO'
    ],
    default: 'CONSUMIDOR_FINAL'
  },
  razon_social: { type: String, trim: true},
  nombre: { type: String, trim: true },
  apellido: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  tel: { type: String, trim: true },
  direccion: addressSchema,
  activo: { type: Boolean, default: true }

}, {
  collection: 'clients',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});



// Historial de ventas del cliente
clientSchema.virtual('ventas', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'client_id'
});

// Nombre completo
clientSchema.virtual('nombre_completo').get(function () {
  return `${this.nombre || ''} ${this.apellido || ''}`.trim();
});


mongoose.models.Client || mongoose.model('Client', clientSchema);


class ClientModel extends BaseModel {
  constructor() {
    super(clientSchema, 'Client');
  }

  async findAll() {
    return await super.findAll([
      {
        path: 'ventas',
        populate: [
          {
            path: 'created_by',
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
        path: 'ventas',
        populate: [
          {
            path: 'created_by',
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