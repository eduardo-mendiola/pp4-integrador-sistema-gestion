import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
