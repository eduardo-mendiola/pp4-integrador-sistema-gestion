import mongoose from "mongoose";
import CashFlow from "../models/CashFlowModel.js";
import CashRegister from "../models/CashRegisterModel.js";

const CashFlowController = {
  // Crear movimiento manual (ingreso/egreso)
  create: async (req, res) => {
    try {
      const openRegister = await CashRegister.findOpenRegister();
      if (!openRegister) {
        return res.status(400).json({
          success: false,
          message: "Debe abrir la caja antes de registrar movimientos"
        });
      }

      const { type, amount, paymentMethod, concept, notes = "" } = req.body;
      const userId = req.user?.id || req.user?._id;

      // Validaciones
      if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "El tipo debe ser INCOME o EXPENSE"
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "El monto debe ser mayor a 0"
        });
      }

      if (!["cash", "debit_card", "credit_card", "transfer"].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Método de pago inválido"
        });
      }

      if (!concept || !concept.trim()) {
        return res.status(400).json({
          success: false,
          message: "El concepto es obligatorio"
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "No se pudo identificar al operador"
        });
      }

      const flow = await CashFlow.create({
        type,
        amount: Number(amount),
        paymentMethod,
        concept: concept.trim(),
        sourceType: "MANUAL",
        cashRegisterId: openRegister._id,
        operatorId: userId,
        notes: notes.trim()
      });

      const populated = await CashFlow.findById(flow._id);
      return res.status(201).json({ success: true, data: populated });
    } catch (error) {
      console.error("Error creando movimiento:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // Listar movimientos con filtros
  getAll: async (req, res) => {
    try {
      const { startDate, endDate, type, paymentMethod, sourceType } = req.query;
      
      const query = {};
      
      if (type) query.type = type;
      if (paymentMethod) query.paymentMethod = paymentMethod;
      if (sourceType) query.sourceType = sourceType;
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }

      const flows = await CashFlow.model.find(query)
        .populate("cashRegisterId", "name")
        .populate("operatorId", "username first_name last_name")
        .sort({ date: -1 })
        .lean();

      return res.json({ success: true, data: flows });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Detalle de un movimiento
  getById: async (req, res) => {
    try {
      const flow = await CashFlow.findById(req.params.id);
      if (!flow) {
        return res.status(404).json({
          success: false,
          message: "Movimiento no encontrado"
        });
      }
      return res.json({ success: true, data: flow });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Eliminar movimiento manual (solo si no está confirmado por cierre de caja)
  delete: async (req, res) => {
    try {
      const flow = await CashFlow.model.findById(req.params.id);
      if (!flow) {
        return res.status(404).json({
          success: false,
          message: "Movimiento no encontrado"
        });
      }

      // Solo se pueden eliminar movimientos manuales
      if (flow.sourceType !== "MANUAL") {
        return res.status(400).json({
          success: false,
          message: "Solo se pueden eliminar movimientos manuales"
        });
      }

      await CashFlow.model.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: "Movimiento eliminado" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Resumen por período y caja
  getSummary: async (req, res) => {
    try {
      const { startDate, endDate, cashRegisterId } = req.query;
      
      let registerId = cashRegisterId;
      if (!registerId) {
        const openRegister = await CashRegister.findOpenRegister();
        registerId = openRegister?._id;
      }

      if (!registerId) {
        return res.status(400).json({
          success: false,
          message: "Debe especificar una caja o haber una abierta"
        });
      }

      const start = startDate ? new Date(startDate) : new Date();
      start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);

      const summary = await CashFlow.getDailySummary(registerId, start);
      return res.json({ success: true, data: summary });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default CashFlowController;