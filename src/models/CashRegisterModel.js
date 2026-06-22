import mongoose from "mongoose";
import BaseModel from "./BaseModel.js";

const cashRegisterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, default: "Caja Principal" },
  status: { 
    type: String, 
    enum: ["OPEN", "CLOSED"], 
    default: "CLOSED" 
  },
  openingDate: { type: Date, default: null },
  closingDate: { type: Date, default: null },
  initialAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, default: null },
  expectedAmount: { type: Number, default: null },
  difference: { type: Number, default: null },
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  openingNotes: { type: String, trim: true, default: "" },
  closingNotes: { type: String, trim: true, default: "" }
}, {
  collection: "cash_registers",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

mongoose.models.CashRegister || mongoose.model("CashRegister", cashRegisterSchema);

class CashRegisterModel extends BaseModel {
  constructor() {
    super(cashRegisterSchema, "CashRegister");
  }

  findAll() {
    return super.findAll([
      { path: "openedBy", select: "username first_name last_name" },
      { path: "closedBy", select: "username first_name last_name" }
    ]);
  }

  findById(id) {
    return super.findById(id, [
      { path: "openedBy", select: "username first_name last_name" },
      { path: "closedBy", select: "username first_name last_name" }
    ]);
  }

  // Obtener la caja actualmente abierta (si existe)
  async findOpenRegister() {
    return this.model.findOne({ status: "OPEN" })
      .populate("openedBy", "username first_name last_name")
      .lean();
  }

  // Obtener la caja principal, si no existe crearla
  async getMainRegister() {
    let mainRegister = await this.model.findOne({ name: "Caja Principal" });
    if (!mainRegister) {
      mainRegister = await this.model.create({
        name: "Caja Principal",
        status: "CLOSED"
      });
    }
    return mainRegister;
  }
}

export default new CashRegisterModel();