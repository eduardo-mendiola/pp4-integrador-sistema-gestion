import mongoose from "mongoose";

const discountRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  timeWithoutSaleMonths: { type: Number, required: true, min: 0 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("DiscountRule", discountRuleSchema);