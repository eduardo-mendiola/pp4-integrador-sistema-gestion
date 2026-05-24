import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const discountRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  timeWithoutSaleMonths: { type: Number, required: true, min: 0 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  active: { type: Boolean, default: true }
}, { timestamps: true });


mongoose.models.DiscountRule || mongoose.model("DiscountRule", discountRuleSchema);

class DiscountRuleModel extends BaseModel {
  constructor() {
    super(discountRuleSchema, "DiscountRule");
  }
}

export default new DiscountRuleModel();