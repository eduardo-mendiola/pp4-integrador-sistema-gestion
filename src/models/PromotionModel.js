import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  discountRuleId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscountRule", required: true },
  startDate: { type: Date, required: true },
  durationDays: { type: Number, required: true, min: 1 },
  endDate: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });


mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);

class PromotionModel extends BaseModel {
  constructor() {
    super(promotionSchema, "Promotion");
  }

  findAll() {
    return super.findAll(["productId", "discountRuleId"]);
  }

  findById(id) {
    return super.findById(id, ["productId", "discountRuleId"]);
  }
}

export default new PromotionModel();