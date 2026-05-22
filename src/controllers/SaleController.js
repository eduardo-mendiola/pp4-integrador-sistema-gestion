import Sale from "../models/SaleModel.js";
import ProductModel from "../models/Product.js";
import Promotion from "../models/Promotion.js";
import DiscountRule from "../models/DiscountRule.js";
import PricingService from "../services/PricingService.js";

const Product = ProductModel.getNativeModel();

const normalizeItems = (items) => {
  if (Array.isArray(items)) return items;
  if (typeof items === "string" && items.trim()) return JSON.parse(items);
  return [];
};

const normalizePayments = (payments) => {
  if (Array.isArray(payments)) return payments;
  if (typeof payments === "string" && payments.trim()) return JSON.parse(payments);
  return [];
};

const enrichItemsWithPricing = async (items) => {
  const productIds = items.map(i => i.productId);

  const [products, promotions, rules] = await Promise.all([
    Product.find({ _id: { $in: productIds } }),
    Promotion.find({ active: true }),
    DiscountRule.find({ active: true })
  ]);

  const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));
  const promotionMap = Object.fromEntries(promotions.map(p => [p.productId.toString(), p]));
  const ruleMap = Object.fromEntries(rules.map(r => [r._id.toString(), r]));

  const result = [];

  for (const item of items) {
    const product = productMap[item.productId];
    const promotion = promotionMap[item.productId];
    const rule = promotion ? ruleMap[promotion.discountRuleId.toString()] : null;

    const price = PricingService.calculateFinalPrice(
      product.price,
      promotion,
      rule,
      product.lastSaleDate
    );

    result.push({
      ...item,
      price,
      subtotal: price * item.quantity
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
        return res.status(404).json({ success: false, message: "Venta no encontrada" });
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

      const normalizedItems = await enrichItemsWithPricing(items);

      const total = normalizedItems.reduce((acc, i) => acc + i.subtotal, 0);
      const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);

      const sale = await Sale.create({
        ...req.body,
        items: normalizedItems,
        payments,
        total,
        status: paidAmount >= total ? "PAID" : "PENDING",
        employee_id: req.user?._id || req.body.employee_id
      });

      return res.status(201).json({ success: true, data: sale });
    } catch (error) {
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
        return res.status(404).json({ success: false, message: "Venta no encontrada" });
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
        return res.status(404).json({ success: false, message: "Venta no encontrada" });
      }

      return res.json({ success: true, message: "Venta eliminada" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default SaleController;