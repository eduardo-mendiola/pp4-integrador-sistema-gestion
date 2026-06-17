import mongoose from "mongoose";
import CashRegister from "../models/CashRegisterModel.js";
import CashFlow from "../models/CashFlowModel.js";

const CashRegisterController = {
  // Abrir caja
  open: async (req, res) => {
    try {
      // Verificar que no haya otra caja abierta
      const openRegister = await CashRegister.findOpenRegister();
      if (openRegister) {
        return res.status(400).json({
          success: false,
          message: "Ya hay una caja abierta. Debe cerrarla antes de abrir una nueva."
        });
      }

      const { initialAmount = 0, notes = "" } = req.body;
      const userId = req.user?.id || req.user?._id;

      if (initialAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "El monto inicial no puede ser negativo"
        });
      }

      // Obtener o crear la caja principal
      const mainRegister = await CashRegister.getMainRegister();

      // Actualizar la caja principal con los datos de apertura
      const updatedRegister = await CashRegister.patch(mainRegister._id, {
        status: "OPEN",
        openingDate: new Date(),
        initialAmount: Number(initialAmount),
        openedBy: userId,
        openingNotes: notes.trim()
      });

      
      const populated = await CashRegister.findById(updatedRegister._id);
      return res.status(201).json({ success: true, data: populated });
    } catch (error) {
      console.error("Error abriendo caja:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cerrar caja (con arqueo)
  close: async (req, res) => {
    try {
      const openRegister = await CashRegister.findOpenRegister();
      if (!openRegister) {
        return res.status(400).json({
          success: false,
          message: "No hay ninguna caja abierta"
        });
      }

      const { finalAmount, notes = "" } = req.body;
      const userId = req.user?.id || req.user?._id;

      if (finalAmount === undefined || finalAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "El monto final es obligatorio y no puede ser negativo"
        });
      }

      // Calcular monto esperado: inicial + ingresos - egresos del día
      const todaySummary = await CashFlow.getDailySummary(openRegister._id);
      const expectedAmount = openRegister.initialAmount + 
                             todaySummary.totalIncomes - 
                             todaySummary.totalExpenses;
      const difference = Number(finalAmount) - expectedAmount;

      const updatedRegister = await CashRegister.patch(openRegister._id, {
        status: "CLOSED",
        closingDate: new Date(),
        finalAmount: Number(finalAmount),
        expectedAmount,
        difference,
        closedBy: userId,
        closingNotes: notes.trim()
      });

      const populated = await CashRegister.findById(updatedRegister._id);
      return res.json({ success: true, data: populated });
    } catch (error) {
      console.error("Error cerrando caja:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Obtener estado actual de la caja
  getStatus: async (req, res) => {
    try {
      const openRegister = await CashRegister.findOpenRegister();
      
      if (!openRegister) {
        return res.json({
          success: true,
          data: { status: "CLOSED", message: "No hay caja abierta" }
        });
      }

      const todaySummary = await CashFlow.getDailySummary(openRegister._id);
      const expectedAmount = openRegister.initialAmount + 
                             todaySummary.totalIncomes - 
                             todaySummary.totalExpenses;

      return res.json({
        success: true,
        data: {
          ...openRegister,
          todaySummary,
          expectedAmount
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Listar historial de cajas (aperturas/cierres)
  getAll: async (req, res) => {
    try {
      const registers = await CashRegister.findAll();
      return res.json({ success: true, data: registers });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Detalle de una caja específica
  getById: async (req, res) => {
    try {
      const register = await CashRegister.findById(req.params.id);
      if (!register) {
        return res.status(404).json({
          success: false,
          message: "Caja no encontrada"
        });
      }
      return res.json({ success: true, data: register });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Resumen del día para la caja abierta
  getDailySummary: async (req, res) => {
    try {
      const openRegister = await CashRegister.findOpenRegister();
      if (!openRegister) {
        return res.status(400).json({
          success: false,
          message: "No hay caja abierta"
        });
      }

      const summary = await CashFlow.getDailySummary(openRegister._id);
      return res.json({ success: true, data: summary });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default CashRegisterController;