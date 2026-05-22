import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  age_range: { type: String, trim: true },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  min_stock_alert: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  collection: "products",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const mongooseModel = mongoose.model("Product", productSchema);

class ProductModel extends BaseModel {
  constructor() {
    super(productSchema, "Product");
  }

  findAll() {
    return super.findAll(["category", "supplier"]);
  }

  findById(id) {
    return super.findById(id, ["category", "supplier"]);
  }

  // 👇 NUEVO: acceso directo para optimización batch
  getNativeModel() {
    return mongooseModel;
  }
}

export default new ProductModel();