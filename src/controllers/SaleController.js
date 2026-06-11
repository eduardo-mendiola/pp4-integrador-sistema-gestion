import mongoose from "mongoose";
import Sale from "../models/SaleModel.js";
import ProductModel from "../models/ProductModel.js";
import Promotion from "../models/PromotionModel.js";
import DiscountRule from "../models/DiscountRuleModel.js";
import PricingService from "../services/PricingService.js";

const Product = ProductModel.getNativeModel();

const normalizeItems = (items) => {
  if (Array.isArray(items)) return items;
  if (typeof items === "string" && items.trim()) return JSON.parse(items);
  return [];
};

const normalizePayments = (payments) => {
  if (Array.isArray(payments)) return payments;
  if (typeof payments === "string" && payments.trim())
    return JSON.parse(payments);
  return [];
};

const enrichItemsWithPricing = async (items) => {
  const productIds = items.map((i) => i.productId);

  // Agregamos .lean() para garantizar que devuelva arrays planos de JS
  const [products, promotions, rules] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).lean(),
    Promotion.model.find({ active: true }).lean(),
    DiscountRule.model.find({ active: true }).lean(),
  ]);

  // Fallbacks por si Mongoose devuelve undefined o un objeto Query
  const safeProducts = Array.isArray(products) ? products : [];
  const safePromotions = Array.isArray(promotions) ? promotions : [];
  const safeRules = Array.isArray(rules) ? rules : [];

  const productMap = Object.fromEntries(
    safeProducts.map((p) => [p._id.toString(), p]),
  );

  const promotionMap = Object.fromEntries(
    safePromotions.map((p) => [p.productId.toString(), p]),
  );

  const ruleMap = Object.fromEntries(
    safeRules.map((r) => [r._id.toString(), r]),
  );

  const result = [];

  for (const item of items) {
    const product = productMap[item.productId];
    const promotion = promotionMap[item.productId];
    const rule = promotion
      ? ruleMap[promotion.discountRuleId?.toString()]
      : null;

    const price = PricingService.calculateFinalPrice(
      product?.price || 0,
      promotion,
      rule,
      product?.lastSaleDate,
    );

    result.push({
      product: item.productId,
      quantity: item.quantity,
      price,
      subtotal: price * item.quantity,
    });
  }

  return result;
};

const SaleController = {
  getAll: async (req, res) => {
    try {
      const data = await Sale.findAll();
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id);

      if (!sale) {
        return res
          .status(404)
          .json({ success: false, message: "Venta no encontrada" });
      }

      return res.json({ success: true, data: sale });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const items = normalizeItems(req.body.items);
      const payments = normalizePayments(req.body.payments);

      // Obtener el modelo nativo de Mongoose directamente
      const ProductNative = mongoose.model("Product");

      // Validar stock disponible ANTES de procesar la venta
      const productIds = items.map((i) => i.productId);
      const products = await ProductNative.find({
        _id: { $in: productIds },
      }).lean();

      if (products.length !== items.length) {
        return res.status(400).json({
          success: false,
          message: "Uno o más productos no existen",
        });
      }

      const productMap = Object.fromEntries(
        products.map((p) => [p._id.toString(), p]),
      );

      // Validar stock suficiente para cada item
      for (const item of items) {
        const product = productMap[item.productId.toString()];
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Producto ${item.productId} no encontrado`,
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
          });
        }
      }

      // Enriquecer items con precios (calcula subtotal)
      const normalizedItems = await enrichItemsWithPricing(items);

      // Calcular total
      const total = normalizedItems.reduce((acc, i) => acc + i.subtotal, 0);
      const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);

      // Crear la venta
      const sale = await Sale.create({
        ...req.body,
        items: normalizedItems,
        payments,
        total,
        status: paidAmount >= total ? "PAID" : "PENDING",
        employee_id: req.user?._id || req.body.employee_id,
      });

      // Si la venta está PAID, descontar stock de cada producto
      if (sale.status === "PAID") {
        try {
          const bulkOps = normalizedItems.map((item) => ({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { stock: -item.quantity } },
            },
          }));

          await ProductNative.bulkWrite(bulkOps);
        } catch (stockError) {
          console.error("Error al actualizar stock:", stockError);
        }
      }

      // El findById del SaleModel ya popula automáticamente
      const populatedSale = await Sale.findById(sale._id);

      return res.status(201).json({ success: true, data: populatedSale });
    } catch (error) {
      console.error("Error al crear venta:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Campos INMUTABLES (integridad financiera)
      delete updateData._id;
      delete updateData.items;
      delete updateData.client_id;
      delete updateData.employee_id;
      delete updateData.total;
      delete updateData.created_at;
      delete updateData.updated_at;

      // Validar y manejar 'status'
      if (updateData.status !== undefined) {
        const validStatuses = ["PENDING", "PAID", "CANCELLED"];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({
            success: false,
            message: `Estado inválido. Debe ser: ${validStatuses.join(", ")}`,
          });
        }

        const currentSale = await Sale.model.findById(id).lean();
        if (!currentSale) {
          return res
            .status(404)
            .json({ success: false, message: "Venta no encontrada" });
        }

        // 🚫 No modificar ventas ya canceladas
        if (currentSale.status === "CANCELLED") {
          return res.status(400).json({
            success: false,
            message: "No se puede modificar una venta cancelada",
          });
        }
      }

      // Manejar 'payments' si se envían
      if (updateData.payments !== undefined) {
        updateData.payments = normalizePayments(updateData.payments);

        // Validación básica de estructura
        for (const p of updateData.payments) {
          if (!p.method || typeof p.amount !== "number" || p.amount < 0) {
            return res.status(400).json({
              success: false,
              message:
                "Cada pago requiere method (ObjectId) y amount (número >= 0)",
            });
          }
        }
      }

      // Merge de metadata si se envía
      if (
        updateData.metadata !== undefined &&
        typeof updateData.metadata === "object"
      ) {
        const currentSale = await Sale.model.findById(id).lean();
        updateData.metadata = {
          ...(currentSale?.metadata || {}),
          ...updateData.metadata,
        };
      }

      // Usar patch del BaseModel
      const updatedSale = await Sale.patch(id, updateData);

      if (!updatedSale) {
        return res
          .status(404)
          .json({ success: false, message: "Venta no encontrada" });
      }

      return res.json({ success: true, data: updatedSale });
    } catch (error) {
      console.error("Error en partialUpdate sale:", error);

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
      const payload = { ...req.body };

      if (payload.items !== undefined) {
        const items = normalizeItems(payload.items);
        payload.items = await enrichItemsWithPricing(items);
        payload.total = payload.items.reduce((acc, i) => acc + i.subtotal, 0);
      }

      if (payload.payments !== undefined) {
        const payments = normalizePayments(payload.payments);
        payload.payments = payments;

        const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
        const total = payload.total || 0;

        payload.status = paidAmount >= total ? "PAID" : "PENDING";
      }

      const sale = await Sale.update(req.params.id, payload);

      if (!sale) {
        return res
          .status(404)
          .json({ success: false, message: "Venta no encontrada" });
      }

      return res.json({ success: true, data: sale });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Sale.delete(req.params.id);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Venta no encontrada" });
      }

      return res.json({ success: true, message: "Venta eliminada" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default SaleController;
