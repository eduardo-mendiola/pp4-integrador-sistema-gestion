import mongoose from "mongoose";
import Sale from "../models/SaleModel.js";
import ProductModel from "../models/ProductModel.js";
import Promotion from "../models/PromotionModel.js";
import DiscountRule from "../models/DiscountRuleModel.js";
import PricingService from "../services/PricingService.js";
import PromotionService from "../services/PromotionService.js";
import CashRegister from "../models/CashRegisterModel.js";
import CashFlow from "../models/CashFlowModel.js";

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

  const [products, promotions, rules] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).lean(),
    Promotion.model.find({ active: true }).lean(),
    DiscountRule.model.find({ active: true }).lean(),
  ]);

  const safeProducts = Array.isArray(products) ? products : [];
  const productMap = Object.fromEntries(
    safeProducts.map((p) => [p._id.toString(), p]),
  );

  const result = [];

  for (const item of items) {
    const product = productMap[item.productId];
    if (!product) continue;

    const automaticDiscount = await PromotionService.calculateAutomaticDiscount(
      item.productId,
    );

    let basePrice = product.price || 0;
    let discountRate = 0;
    let discount = 0;

    // Priorizar el descuento manual del frontend
    const manualDiscount = Number(item.discount_rate) || 0;

    if (manualDiscount > 0) {
      discountRate = manualDiscount;
    } else if (automaticDiscount && automaticDiscount.discountRate > 0) {
      // Si no hay manual, usar el automático
      discountRate = automaticDiscount.discountRate;
    }

    // Calcular monto del descuento por unidad y precio final
    discount = basePrice * (discountRate / 100);
    const finalPrice = basePrice - discount;
    const itemSubtotal = finalPrice * item.quantity;

    result.push({
      product: item.productId,
      quantity: item.quantity,
      price: finalPrice,
      originalPrice: basePrice,
      discount_rate: discountRate,
      discount: discount * item.quantity,
      subtotal: itemSubtotal,
      // Solo guardamos el objeto automaticDiscount si NO fue un descuento manual
      automaticDiscount:
        manualDiscount === 0 && automaticDiscount ? automaticDiscount : null,
    });
  }

  return result;
};

// Mapear nombre del método de pago al formato de CashFlow
const mapPaymentMethodToCashFlow = (paymentMethodName) => {
  if (!paymentMethodName) return "cash";

  const name = paymentMethodName.toLowerCase();

  if (name.includes("efectivo") || name.includes("cash")) {
    return "cash";
  }
  if (
    name.includes("débito") ||
    name.includes("debito") ||
    name.includes("debit")
  ) {
    return "debit_card";
  }
  if (
    name.includes("crédito") ||
    name.includes("credito") ||
    name.includes("credit")
  ) {
    return "credit_card";
  }
  if (name.includes("transfer")) {
    return "transfer";
  }

  return "cash"; // Default
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
      // Validar que haya una caja abierta
      const openRegister = await CashRegister.findOpenRegister();
      if (!openRegister) {
        return res.status(400).json({
          success: false,
          message:
            "No se pueden registrar ventas. La caja está cerrada. Por favor, abra la caja primero.",
        });
      }

      const items = normalizeItems(req.body.items);
      const payments = normalizePayments(req.body.payments);

      const ProductNative = mongoose.model("Product");

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

      const normalizedItems = await enrichItemsWithPricing(items);

      // Calcular subtotal BRUTO usando originalPrice
      const subtotalBruto = normalizedItems.reduce(
        (acc, i) => acc + i.originalPrice * i.quantity,
        0,
      );

      // Descuentos individuales (ya calculados en enrichItemsWithPricing)
      const itemDiscountsTotal = normalizedItems.reduce(
        (acc, i) => acc + i.discount,
        0,
      );

      // Subtotal NETO (después de descuentos individuales)
      const subtotal = subtotalBruto - itemDiscountsTotal;

      // Descuento global
      const discount_rate =
        typeof req.body.discount_rate === "number" ? req.body.discount_rate : 0;
      const globalDiscount = subtotal * (discount_rate / 100);

      const discount = itemDiscountsTotal + globalDiscount;

      // Base imponible = Subtotal bruto - todos los descuentos
      const taxableBase = subtotalBruto - discount;
      const tax_rate = 21;
      const tax = taxableBase * (tax_rate / 100);
      const total = taxableBase + tax;

      const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);

      const sale = await Sale.create({
        ...req.body,
        items: normalizedItems,
        payments,
        subtotal,
        discount_rate,
        discount,
        tax_rate,
        tax,
        total,
        status: paidAmount >= total ? "PAID" : "PENDING",
        employee_id: req.user?._id || req.body.employee_id,
      });

      if (sale.status === "PAID") {
        try {
          const bulkOps = normalizedItems.map((item) => ({
            updateOne: {
              filter: { _id: item.product },
              update: {
                $inc: { stock: -item.quantity },
                $set: { lastSaleDate: new Date() },
              },
            },
          }));

          await ProductNative.bulkWrite(bulkOps);
        } catch (stockError) {
          console.error("Error al actualizar stock:", stockError);
        }

        // NUEVO PASO 2: Registrar ingresos en caja automáticamente
        try {
          const populatedSale = await Sale.model
            .findById(sale._id)
            .populate("payments.method");

          const operatorId = req.user?._id || req.body.employee_id;

          if (populatedSale.payments && populatedSale.payments.length > 0) {
            for (const payment of populatedSale.payments) {
              // Solo registrar pagos CONFIRMED
              if (payment.status !== "CONFIRMED") continue;

              const methodName = payment.method?.name || "";
              const cfPaymentMethod = mapPaymentMethodToCashFlow(methodName);

              await CashFlow.create({
                type: "INCOME",
                amount: payment.amount,
                paymentMethod: cfPaymentMethod,
                concept: `Venta #${sale._id.toString().slice(-8).toUpperCase()}`,
                sourceType: "SALE",
                sourceId: sale._id,
                cashRegisterId: openRegister._id,
                operatorId: operatorId,
                notes: payment.reference || "",
              });
            }
          }
        } catch (cashFlowError) {
          // IMPORTANTE: Si falla el registro en caja, NO fallar la venta
          // La venta ya está creada y el stock actualizado
          console.error("Error registrando movimiento en caja:", cashFlowError);
        }
      }

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

      // Obtener venta actual para validaciones
      const currentSale = await Sale.model.findById(id).lean();
      if (!currentSale) {
        return res.status(404).json({
          success: false,
          message: "Venta no encontrada",
        });
      }

      // Validar y manejar 'status'
      if (updateData.status !== undefined) {
        const validStatuses = ["PENDING", "PAID", "CANCELLED"];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({
            success: false,
            message: `Estado inválido. Debe ser: ${validStatuses.join(", ")}`,
          });
        }

        // No modificar ventas ya canceladas
        if (currentSale.status === "CANCELLED") {
          return res.status(400).json({
            success: false,
            message: "No se puede modificar una venta cancelada",
          });
        }

        // Si se está anulando una venta PAID, reintegrar stock y registrar devolución en caja
        if (
          updateData.status === "CANCELLED" &&
          currentSale.status === "PAID"
        ) {
          try {
            const ProductNative = mongoose.model("Product");
            const openRegister = await CashRegister.findOpenRegister();

            // 1. Reintegrar stock
            const bulkOps = currentSale.items.map((item) => ({
              updateOne: {
                filter: { _id: item.product },
                update: { $inc: { stock: item.quantity } },
              },
            }));
            await ProductNative.bulkWrite(bulkOps);

            // 2. Registrar egreso en caja si hubo pagos en EFECTIVO
            if (
              openRegister &&
              currentSale.payments &&
              currentSale.payments.length > 0
            ) {
              // Necesitamos el nombre del método de pago para saber si fue efectivo
              const saleWithMethods = await Sale.model
                .findById(currentSale._id)
                .populate("payments.method");

              for (const payment of saleWithMethods.payments) {
                const methodName = payment.method?.name || "";
                const isCash =
                  methodName.toLowerCase().includes("efectivo") ||
                  methodName.toLowerCase().includes("cash");

                if (isCash && payment.status === "CONFIRMED") {
                  await CashFlow.create({
                    type: "EXPENSE",
                    amount: payment.amount,
                    paymentMethod: "cash",
                    concept: `Devolución Venta #${currentSale._id.toString().slice(-8).toUpperCase()}`,
                    sourceType: "RETURN",
                    sourceId: currentSale._id,
                    cashRegisterId: openRegister._id,
                    operatorId: req.user?._id || currentSale.employee_id,
                    notes:
                      updateData.metadata?.cancel_reason ||
                      "Anulación de venta",
                  });
                }
              }
            }
            console.log(
              `Stock reintegrado y caja actualizada para venta anulada: ${id}`,
            );
          } catch (stockError) {
            console.error(
              "Error al reintegrar stock o registrar devolución:",
              stockError,
            );
          }
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
        updateData.metadata = {
          ...(currentSale?.metadata || {}),
          ...updateData.metadata,
        };
      }

      // Usar patch del BaseModel
      const updatedSale = await Sale.patch(id, updateData);

      if (!updatedSale) {
        return res.status(404).json({
          success: false,
          message: "Venta no encontrada",
        });
      }

      // Popular antes de devolver
      const populatedSale = await Sale.findById(updatedSale._id);

      return res.json({ success: true, data: populatedSale });
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
