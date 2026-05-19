import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  neighborhood: { type: String, trim: true },
  city: { type: String, trim: true }
}, { _id: false });

const personSchema = new mongoose.Schema({
  dni: { type: String, required: true, unique: true, trim: true },
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: addressSchema
}, {
  collection: 'persons',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

class PersonModel extends BaseModel {
  constructor() {
    super(personSchema, 'Person');
  }
}

export default new PersonModel();