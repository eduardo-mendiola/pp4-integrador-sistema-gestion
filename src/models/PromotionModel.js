import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  discountRuleId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscountRule", required: true },
  startDate: { type: Date, required: true },
  durationDays: { type: Number, required: true },
  endDate: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Promotion", promotionSchema);