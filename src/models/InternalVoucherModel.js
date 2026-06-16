import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const internalVoucherSchema = new mongoose.Schema({
  voucherNumber: { type: Number, required: true, unique: true },
  prefix: { type: String, default: "CI", trim: true },
  formattedNumber: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ["INCOME", "EXPENSE", "ADJUSTMENT"], 
    required: true 
  },
  date: { type: Date, default: Date.now },
  concept: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { 
    type: String, 
    enum: ["cash", "debit_card", "credit_card", "transfer", "none"], 
    default: "none" 
  },
  relatedEntityType: { 
    type: String, 
    enum: ["PRODUCT", "SUPPLIER", "CLIENT", "OTHER"], 
    default: "OTHER" 
  },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  operatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  cashRegisterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CashRegister", 
    default: null 
  },
  status: { 
    type: String, 
    enum: ["DRAFT", "CONFIRMED", "CANCELLED"], 
    default: "CONFIRMED" 
  },
  notes: { type: String, trim: true, default: "" },
  affectsCashFlow: { type: Boolean, default: false }
}, {
  collection: "internal_vouchers",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

internalVoucherSchema.index({ formattedNumber: 1 });
internalVoucherSchema.index({ date: -1 });

mongoose.models.InternalVoucher || mongoose.model("InternalVoucher", internalVoucherSchema);

class InternalVoucherModel extends BaseModel {
  constructor() {
    super(internalVoucherSchema, "InternalVoucher");
  }

  findAll() {
    return super.findAll([
      { path: "operatorId", select: "username first_name last_name" },
      { path: "cashRegisterId", select: "name" },
      { path: "relatedEntityId" }
    ]);
  }

  findById(id) {
    return super.findById(id, [
      { path: "operatorId", select: "username first_name last_name" },
      { path: "cashRegisterId", select: "name" },
      { path: "relatedEntityId" }
    ]);
  }

  // Generar el próximo número de comprobante correlativo
  async generateNextVoucherNumber(prefix = "CI") {
    const lastVoucher = await this.model
      .findOne({ prefix })
      .sort({ voucherNumber: -1 })
      .lean();
    
    const nextNumber = lastVoucher ? lastVoucher.voucherNumber + 1 : 1;
    const formattedNumber = `${prefix}-${String(nextNumber).padStart(8, '0')}`;
    
    return { voucherNumber: nextNumber, formattedNumber, prefix };
  }

  // Buscar comprobantes en un rango de fechas
  async findByDateRange(startDate, endDate, filters = {}) {
    const query = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.operatorId) query.operatorId = filters.operatorId;
    
    return this.model.find(query)
      .populate("operatorId", "username first_name last_name")
      .populate("cashRegisterId", "name")
      .sort({ date: -1 })
      .lean();
  }

  // Resumen de comprobantes por período
  async getSummary(startDate, endDate) {
    const vouchers = await this.model.find({
      date: { $gte: startDate, $lte: endDate },
      status: "CONFIRMED"
    }).lean();

    const summary = {
      total: vouchers.length,
      byType: {
        INCOME: { count: 0, total: 0 },
        EXPENSE: { count: 0, total: 0 },
        ADJUSTMENT: { count: 0, total: 0 }
      },
      grandTotal: 0
    };

    vouchers.forEach(v => {
      summary.byType[v.type].count += 1;
      summary.byType[v.type].total += v.amount;
      if (v.type === "INCOME") summary.grandTotal += v.amount;
      else if (v.type === "EXPENSE") summary.grandTotal -= v.amount;
    });

    return summary;
  }
}

export default new InternalVoucherModel();