import mongoose from 'mongoose';

const { Schema } = mongoose;

const SupplierSchema = new Schema({
  name: { type: String, required: true, trim: true },
  contact_name: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  address: { type: String, trim: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
