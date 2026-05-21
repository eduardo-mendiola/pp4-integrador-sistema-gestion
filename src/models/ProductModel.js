import mongoose from 'mongoose';

const { Schema } = mongoose;

// Product schema based on the requirements document (inventory core)
const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true, index: true },
  category: { type: String, trim: true },
  supplier: { type: String, trim: true },
  age_range: { type: String, trim: true }, // e.g. "0-3", "4-7"
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  min_stock_alert: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
