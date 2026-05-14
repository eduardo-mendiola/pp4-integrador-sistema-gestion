import mongoose from 'mongoose';

const { Schema } = mongoose;

const SaleItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const SaleSchema = new Schema({
  items: { type: [SaleItemSchema], required: true },
  total: { type: Number, required: true },
  customer_name: { type: String, trim: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
