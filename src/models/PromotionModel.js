import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  discountRuleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DiscountRule" }], 
  startDate: { type: Date, required: true },
  durationDays: { type: Number, required: true, min: 1 },
  endDate: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Hook para calcular endDate automáticamente
promotionSchema.pre('save', function(next) {
  if (this.startDate && this.durationDays && !this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.durationDays);
    this.endDate = endDate;
  }
  next();
});

mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);

class PromotionModel extends BaseModel {
  constructor() {
    super(promotionSchema, "Promotion");
  }

  findAll() {
    return super.findAll([
      { path: "discountRuleIds" }
    ]);
  }

  findById(id) {
    return super.findById(id, [
      { path: "discountRuleIds" }
    ]);
  }

  // Encontrar promociones activas en una fecha (sin filtro de producto)
  findActiveByDate(date = new Date()) {
    return this.model.find({
      active: true,
      startDate: { $lte: date },
      endDate: { $gte: date }
    }).populate('discountRuleIds').lean();
  }
}

export default new PromotionModel();