import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const personSchema = new mongoose.Schema({
  dni: { type: String, required: true, unique: true, trim: true },
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true }
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