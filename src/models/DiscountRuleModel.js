import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const discountRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  active: { type: Boolean, default: true },
  
  conditions: {
    // Filtros de identidad
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    brands: [{ type: String, trim: true }],
    supplierIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
    ageRanges: [{ type: String, trim: true }],
    
    // Filtros de estado (rangos)
    minMonthsWithoutSale: { type: Number, min: 0 },
    maxMonthsWithoutSale: { type: Number, min: 0 },
    minStockQuantity: { type: Number, min: 0 },
    maxStockQuantity: { type: Number, min: 0 },
    minMonthsInStock: { type: Number, min: 0 },   
    maxMonthsInStock: { type: Number, min: 0 }    
  }
}, { timestamps: true });

// Hook de migración para datos antiguos
discountRuleSchema.pre('save', function(next) {
  if (!this.conditions) this.conditions = {};
  
  // Migrar timeWithoutSaleMonths viejo
  if (this.timeWithoutSaleMonths !== undefined && !this.conditions.minMonthsWithoutSale) {
    this.conditions.minMonthsWithoutSale = this.timeWithoutSaleMonths;
    delete this.timeWithoutSaleMonths;
  }
  
  // Migrar daysInStock a monthsInStock
  if (this.conditions.minDaysInStock != null && this.conditions.minMonthsInStock == null) {
    this.conditions.minMonthsInStock = Math.floor(this.conditions.minDaysInStock / 30);
    delete this.conditions.minDaysInStock;
  }
  if (this.conditions.maxDaysInStock != null && this.conditions.maxMonthsInStock == null) {
    this.conditions.maxMonthsInStock = Math.floor(this.conditions.maxDaysInStock / 30);
    delete this.conditions.maxDaysInStock;
  }
  
  next();
});

mongoose.models.DiscountRule || mongoose.model("DiscountRule", discountRuleSchema);

class DiscountRuleModel extends BaseModel {
  constructor() {
    super(discountRuleSchema, "DiscountRule");
  }
}

export default new DiscountRuleModel();