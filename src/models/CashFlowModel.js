import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const cashFlowSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["INCOME", "EXPENSE"], 
    required: true 
  },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { 
    type: String, 
    enum: ["cash", "debit_card", "credit_card", "transfer"], 
    required: true 
  },
  concept: { type: String, required: true, trim: true },
  sourceType: { 
    type: String, 
    enum: ["SALE", "RETURN", "VOUCHER", "MANUAL", "OPENING", "CLOSING"], 
    required: true 
  },
  sourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  cashRegisterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CashRegister", 
    required: true 
  },
  operatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  date: { type: Date, default: Date.now },
  notes: { type: String, trim: true, default: "" }
}, {
  collection: "cash_flows",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

// Índice para búsquedas rápidas por caja y fecha
cashFlowSchema.index({ cashRegisterId: 1, date: -1 });
cashFlowSchema.index({ sourceType: 1, sourceId: 1 });

mongoose.models.CashFlow || mongoose.model("CashFlow", cashFlowSchema);

class CashFlowModel extends BaseModel {
  constructor() {
    super(cashFlowSchema, "CashFlow");
  }

  findAll() {
    return super.findAll([
      { path: "cashRegisterId", select: "name" },
      { path: "operatorId", select: "username first_name last_name" }
    ]);
  }

  findById(id) {
    return super.findById(id, [
      { path: "cashRegisterId", select: "name" },
      { path: "operatorId", select: "username first_name last_name" }
    ]);
  }

  // Resumen desde la apertura de la caja, no desde medianoche
  async getDailySummary(cashRegisterId, date = new Date()) {
    // Buscar la caja para obtener su fecha de apertura
    const CashRegister = (await import('../models/CashRegisterModel.js')).default;
    const register = await CashRegister.model.findById(cashRegisterId).lean();
    
    // Usar la fecha de apertura de la caja, o el inicio del día si no existe
    const startDate = register?.openingDate 
      ? new Date(register.openingDate) 
      : new Date(date);
    
    if (!register?.openingDate) {
      startDate.setHours(0, 0, 0, 0);
    }
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const flows = await this.model.find({
      cashRegisterId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const summary = {
      totalIncomes: 0,
      totalExpenses: 0,
      incomeCount: 0,
      expenseCount: 0,
      balance: 0,
      count: flows.length,
      byPaymentMethod: {
        cash: { incomes: 0, expenses: 0, incomeCount: 0, expenseCount: 0 },
        debit_card: { incomes: 0, expenses: 0, incomeCount: 0, expenseCount: 0 },
        credit_card: { incomes: 0, expenses: 0, incomeCount: 0, expenseCount: 0 },
        transfer: { incomes: 0, expenses: 0, incomeCount: 0, expenseCount: 0 }
      },
      bySourceType: {}
    };

    flows.forEach(flow => {
      if (flow.type === "INCOME") {
        summary.totalIncomes += flow.amount;
        summary.incomeCount += 1;
        summary.byPaymentMethod[flow.paymentMethod].incomes += flow.amount;
        summary.byPaymentMethod[flow.paymentMethod].incomeCount += 1;
      } else {
        summary.totalExpenses += flow.amount;
        summary.expenseCount += 1;
        summary.byPaymentMethod[flow.paymentMethod].expenses += flow.amount;
        summary.byPaymentMethod[flow.paymentMethod].expenseCount += 1;
      }

      if (!summary.bySourceType[flow.sourceType]) {
        summary.bySourceType[flow.sourceType] = { count: 0, total: 0 };
      }
      summary.bySourceType[flow.sourceType].count += 1;
      summary.bySourceType[flow.sourceType].total += flow.amount;
    });

    summary.balance = summary.totalIncomes - summary.totalExpenses;
    return summary;
  }

  // Listar movimientos de una caja en un rango de fechas
  async findByRegisterAndDateRange(cashRegisterId, startDate, endDate) {
    return this.model.find({
      cashRegisterId,
      date: { $gte: startDate, $lte: endDate }
    })
      .populate("operatorId", "username first_name last_name")
      .sort({ date: -1 })
      .lean();
  }

  // Verificar si ya existe un movimiento para una fuente (evitar duplicados)
  async existsForSource(sourceType, sourceId) {
    const existing = await this.model.findOne({ sourceType, sourceId });
    return !!existing;
  }
}

export default new CashFlowModel();