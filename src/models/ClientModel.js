import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postal_code: String,
  country: String,
  number: String
}, { _id: false });

const billingInfoSchema = new mongoose.Schema({
  payment_terms: String,
  currency: String,
  email: String
}, { _id: false });

const clientSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  client_type: { type: String, enum: ['person', 'company'], required: true },
  name: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  id_type: { type: String, enum: ['DNI', 'CUIL', 'CUIT'] },
  id_number: { type: String },
  category: { type: String },
  company_type: { type: String },
  website: { type: String },
  phone: { type: String },
  address: addressSchema,
  billing_info: billingInfoSchema,
  is_active: { type: Boolean, default: true }
}, {
  collection: 'clients',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});


// Virtual populate: traer los contactos de este cliente
clientSchema.virtual('contacts', {
  ref: 'Contact',           
  localField: '_id',        
  foreignField: 'client_id' 
});

// Virtual populate: traer los proyectos de este cliente
clientSchema.virtual('projects', {
  ref: 'Project',           
  localField: '_id',        
  foreignField: 'client_id' 
});


// Virtual auxiliar (lista de nombres de contactos)
clientSchema.virtual('contacts_names').get(function () {
  if (!this.contacts || this.contacts.length === 0) return 'Sin contactos';
  return this.contacts.map(c => `${c.first_name} ${c.last_name} - Código: ${c.code}`).join(', ');
});

clientSchema.virtual('projects_titles').get(function () {
  if (!this.projects || this.projects.length === 0) return 'Sin proyectos';
  return this.projects.map(p => `${p.title} - Código: ${p.code}`).join(', ');
});


class ClientModel extends BaseModel {
  constructor() {
    super(clientSchema, 'Client');
  }

  async findAll() {
    // populate automático con contactos
    return super.findAll([
      'contacts', 
       { path: 'projects', populate: { path: 'project_manager' } }
    ]);
  }

  async findById(id) {
    return super.findById(id, [
      'contacts', 
       { path: 'projects', populate: { path: 'project_manager' } }
    ]);
  }
}

export default new ClientModel();
