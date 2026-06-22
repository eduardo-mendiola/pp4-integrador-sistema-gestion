import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

// Define the Category schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true }
}, {
  collection: 'categories',
  timestamps: true
});

class CategoryModel extends BaseModel {
  constructor() {
    super(categorySchema, 'Category');
  }
}

export default new CategoryModel();