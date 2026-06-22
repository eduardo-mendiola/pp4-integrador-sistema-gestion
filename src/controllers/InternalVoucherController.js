import mongoose from "mongoose";
import InternalVoucher from "../models/InternalVoucherModel.js";
import CashFlow from "../models/CashFlowModel.js";
import CashRegister from "../models/CashRegisterModel.js";

const InternalVoucherController = {
  // Crear comprobante interno
  create: async (req, res) => {
    try {
      const { 
        type, concept, amount, paymentMethod = "none",
        relatedEntityType = "OTHER", relatedEntityId = null,
        notes = "", affectsCashFlow = false, prefix = "CI"
      } = req.body;
      const userId = req.user?.id || req.user?._id;

      // Validaciones
      if (!["INCOME", "EXPENSE", "ADJUSTMENT"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "El tipo debe ser INCOME, EXPENSE o ADJUSTMENT"
        });
      }

      if (!concept || !concept.trim()) {
        return res.status(400).json({
          success: false,
          message: "El concepto es obligatorio"
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "El monto debe ser mayor a 0"
        });
      }

      const validMethods = ["cash", "debit_card", "credit_card", "transfer", "none"];
      if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Método de pago inválido"
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "No se pudo identificar al operador"
        });
      }

      // Generar número correlativo
      const { voucherNumber, formattedNumber } = 
        await InternalVoucher.generateNextVoucherNumber(prefix);

      // Si afecta caja, necesitamos una caja abierta
      let cashRegisterId = null;
      if (affectsCashFlow) {
        const openRegister = await CashRegister.findOpenRegister();
        if (!openRegister) {
          return res.status(400).json({
            success: false,
            message: "Debe abrir la caja para registrar un comprobante que afecta el flujo"
          });
        }
        cashRegisterId = openRegister._id;
      }

      // Crear el comprobante
      const voucher = await InternalVoucher.create({
        voucherNumber,
        prefix,
        formattedNumber,
        type,
        concept: concept.trim(),
        amount: Number(amount),
        paymentMethod,
        relatedEntityType,
        relatedEntityId: relatedEntityId || null,
        operatorId: userId,
        cashRegisterId,
        notes: notes.trim(),
        affectsCashFlow,
        status: "CONFIRMED"
      });

      // Si afecta caja, crear el movimiento correspondiente
      if (affectsCashFlow && cashRegisterId) {
        const flowType = type === "INCOME" ? "INCOME" : "EXPENSE";
        await CashFlow.create({
          type: flowType,
          amount: Number(amount),
          paymentMethod: paymentMethod === "none" ? "cash" : paymentMethod,
          concept: `Comprobante ${formattedNumber}: ${concept.trim()}`,
          sourceType: "VOUCHER",
          sourceId: voucher._id,
          cashRegisterId,
          operatorId: userId,
          notes: notes.trim()
        });
      }

      const populated = await InternalVoucher.findById(voucher._id);
      return res.status(201).json({ success: true, data: populated });
    } catch (error) {
      console.error("Error creando comprobante:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // Listar comprobantes con filtros
  getAll: async (req, res) => {
    try {
      const { startDate, endDate, type, status, operatorId } = req.query;
      
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (operatorId) query.operatorId = operatorId;
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }

      const vouchers = await InternalVoucher.model.find(query)
        .populate("operatorId", "username first_name last_name")
        .populate("cashRegisterId", "name")
        .sort({ date: -1 })
        .lean();

      return res.json({ success: true, data: vouchers });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Detalle de un comprobante
  getById: async (req, res) => {
    try {
      const voucher = await InternalVoucher.findById(req.params.id);
      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: "Comprobante no encontrado"
        });
      }
      return res.json({ success: true, data: voucher });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cancelar comprobante (reversa el movimiento de caja si corresponde)
  cancel: async (req, res) => {
    try {
      const voucher = await InternalVoucher.model.findById(req.params.id);
      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: "Comprobante no encontrado"
        });
      }

      if (voucher.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "El comprobante ya está cancelado"
        });
      }

      // Si afecta caja, eliminar el movimiento correspondiente
      if (voucher.affectsCashFlow) {
        await CashFlow.model.deleteOne({
          sourceType: "VOUCHER",
          sourceId: voucher._id
        });
      }

      voucher.status = "CANCELLED";
      await voucher.save();

      const populated = await InternalVoucher.findById(voucher._id);
      return res.json({ success: true, data: populated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Resumen de comprobantes por período
  getSummary: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date();
      start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);

      // Validar fechas
      const summary = await InternalVoucher.getSummary(start, end);
      return res.json({ success: true, data: summary });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default InternalVoucherController;