import mongoose from "mongoose";
import Promotion from "../models/PromotionModel.js";
import PromotionService from "../services/PromotionService.js";

const PromotionController = {
  create: async (req, res) => {
    try {
      const { discountRuleIds } = req.body;

      // Validar que discountRuleIds sea un array
      if (!Array.isArray(discountRuleIds) || discountRuleIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "discountRuleIds debe ser un array con al menos una regla",
        });
      }

      // Validar que todos los IDs sean válidos
      for (const id of discountRuleIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: `${id} no es un ID válido`,
          });
        }
      }

      const promotion = await Promotion.create(req.body);
      return res.status(201).json({ success: true, data: promotion });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const promotions = await Promotion.findAll();
      return res.json({ success: true, data: promotions });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const promotion = await Promotion.findById(req.params.id);
      if (!promotion) {
        return res
          .status(404)
          .json({ success: false, message: "Promoción no encontrada" });
      }
      return res.json({ success: true, data: promotion });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.productId; 

      if (updateData.name !== undefined) {
        updateData.name = updateData.name.trim();
      }

      // Validar discountRuleIds si se envía
      if (updateData.discountRuleIds !== undefined) {
        if (!Array.isArray(updateData.discountRuleIds)) {
          return res.status(400).json({
            success: false,
            message: "discountRuleIds debe ser un array",
          });
        }
        for (const ruleId of updateData.discountRuleIds) {
          if (!mongoose.Types.ObjectId.isValid(ruleId)) {
            return res.status(400).json({
              success: false,
              message: `${ruleId} no es un ID válido`,
            });
          }
        }
      }

      if (updateData.durationDays !== undefined) {
        const days = Number(updateData.durationDays);
        if (isNaN(days) || days < 1) {
          return res
            .status(400)
            .json({
              success: false,
              message: "durationDays debe ser un número mayor a 0",
            });
        }
        updateData.durationDays = days;
      }

      ["startDate", "endDate"].forEach((field) => {
        if (updateData[field] !== undefined && updateData[field] !== null) {
          const date = new Date(updateData[field]);
          if (isNaN(date.getTime())) {
            return res
              .status(400)
              .json({
                success: false,
                message: `${field} debe ser una fecha válida`,
              });
          }
          updateData[field] = date;
        }
      });

      // Auto-calcular endDate
      if (
        updateData.startDate !== undefined ||
        updateData.durationDays !== undefined
      ) {
        const currentPromo = await Promotion.model.findById(id);
        const start =
          updateData.startDate !== undefined
            ? updateData.startDate
            : currentPromo.startDate;
        const days =
          updateData.durationDays !== undefined
            ? updateData.durationDays
            : currentPromo.durationDays;
        if (start && days) {
          const endDate = new Date(start);
          endDate.setDate(endDate.getDate() + days);
          updateData.endDate = endDate;
        }
      }

      if (updateData.active !== undefined) {
        updateData.active = Boolean(updateData.active);
      }

      const updatedPromotion = await Promotion.patch(id, updateData);
      if (!updatedPromotion) {
        return res
          .status(404)
          .json({ success: false, message: "Promoción no encontrada" });
      }

      return res.json({ success: true, data: updatedPromotion });
    } catch (error) {
      console.error("Error en partialUpdate promotion:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: Object.values(error.errors).map((e) => e.message),
        });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.productId; // Eliminar productId si viene

      const updatedPromotion = await Promotion.model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      );
      if (!updatedPromotion) {
        return res
          .status(404)
          .json({ success: false, message: "Promoción no encontrada" });
      }
      return res.json({ success: true, data: updatedPromotion });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Promotion.model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Promoción no encontrada" });
      }
      return res.json({ success: true, message: "Promoción eliminada" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Obtener promociones activas en una fecha (sin filtro de producto)
  getActiveByDate: async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date) : new Date();

      const promotions = await Promotion.findActiveByDate(date);
      return res.json({ success: true, data: promotions });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Calcular descuento automático para un producto
  calculateDiscount: async (req, res) => {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "productId es requerido",
        });
      }

      const result =
        await PromotionService.calculateAutomaticDiscount(productId);

      if (!result) {
        return res.json({
          success: true,
          data: null,
          message: "No hay descuento automático disponible",
        });
      }

      return res.json({
        success: true,
        data: {
          discountRate: result.discountRate,
          promotion: {
            _id: result.promotion._id,
            name: result.promotion.name,
          },
          discountRule: {
            _id: result.discountRule._id,
            name: result.discountRule.name,
            percentage: result.discountRule.percentage,
          },
          matchedConditions: result.matchedConditions,
        },
      });
    } catch (error) {
      console.error("Error calculando descuento:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default PromotionController;
