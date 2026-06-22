import mongoose from "mongoose";
import Return from "../models/ReturnModel.js";
import Sale from "../models/SaleModel.js";
import ProductModel from "../models/ProductModel.js";
import CashRegister from "../models/CashRegisterModel.js";
import CashFlow from "../models/CashFlowModel.js";

const Product = ProductModel.getNativeModel();

// Función para mapear nombre del método de pago al formato de CashFlow
const mapPaymentMethodToCashFlow = (paymentMethodName) => {
  if (!paymentMethodName) return "cash";
  const name = paymentMethodName.toLowerCase();
  if (name.includes("efectivo") || name.includes("cash")) return "cash";
  if (name.includes("débito") || name.includes("debito") || name.includes("debit")) return "debit_card";
  if (name.includes("crédito") || name.includes("credito") || name.includes("credit")) return "credit_card";
  if (name.includes("transfer")) return "transfer";
  return "cash";
};

const ReturnController = {
  getAll: async (req, res) => {
    try {
      const data = await Return.findAll();
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const returnData = await Return.findById(req.params.id);
      if (!returnData) {
        return res
          .status(404)
          .json({ success: false, message: "Devolución no encontrada" });
      }
      return res.json({ success: true, data: returnData });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const {
        original_sale_id,
        type,
        reason,
        reason_custom,
        items,
        exchange_items,
        exchange_total,
        difference,
        payment_method,
        payment_reference,
      } = req.body;

      const originalSale = await Sale.model.findById(original_sale_id);
      if (!originalSale) {
        return res
          .status(404)
          .json({ success: false, message: "Venta original no encontrada" });
      }

      // No permitir devolver ventas ya devueltas o canceladas
      if (originalSale.has_returns === true) {
        return res.status(400).json({
          success: false,
          message: "Esta venta ya tiene devoluciones registradas y no puede ser devuelta nuevamente."
        });
      }

      if (originalSale.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "Esta venta está cancelada y no puede ser devuelta."
        });
      }

      const saleDate = new Date(originalSale.createdAt);
      const today = new Date();
      const daysDiff = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));

      if (daysDiff > 30) {
        return res.status(400).json({
          success: false,
          message: `La venta tiene ${daysDiff} días. El plazo máximo es 30 días.`,
        });
      }

      // Calcular montos de la devolución
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const discountsIndividual = items.reduce((sum, item) => {
        const proporcion = item.quantity / item.maxQuantity;
        return sum + item.discount * proporcion;
      }, 0);

      const baseAfterIndividualDiscounts = subtotal - discountsIndividual;
      const discountGlobal =
        baseAfterIndividualDiscounts *
        ((originalSale.discount_rate || 0) / 100);
      const discountTotal = discountsIndividual + discountGlobal;

      const baseImponible = subtotal - discountTotal;
      const taxRate = originalSale.tax_rate || 21;
      const tax = baseImponible * (taxRate / 100);
      const total = baseImponible + tax;

      // 1. Crear el registro de Devolución/Cambio
      const returnData = await Return.create({
        original_sale_id,
        type,
        reason,
        reason_custom: reason_custom || "",
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount_rate: item.discount_rate || 0,
          discount: item.discount || 0,
          subtotal: item.subtotal,
        })),
        subtotal,
        discount_rate: originalSale.discount_rate || 0,
        discount: discountTotal,
        tax_rate: taxRate,
        tax,
        total,
        exchange_items: exchange_items || [],
        exchange_total: exchange_total || 0,
        difference: difference || 0,
        payment_method: payment_method || null,
        payment_reference: payment_reference || "",
        employee_id: req.user?._id || req.body.employee_id,
        status: "COMPLETED",
      });

      // 2. Si es un cambio, crear la venta de reemplazo con cálculo contable correcto
      let replacementSaleId = null;
      if (
        (type === "EXCHANGE_SAME" || type === "EXCHANGE_OTHER") &&
        exchange_items &&
        exchange_items.length > 0
      ) {
        // Aplicar descuentos a los items de cambio
        const replacementItems = exchange_items.map((item) => {
          const itemDiscountRate = item.discount_rate || 0;
          const itemSubtotal = item.price * item.quantity;
          const itemDiscount = itemSubtotal * (itemDiscountRate / 100);
          const itemTotalAfterDiscount = itemSubtotal - itemDiscount;

          return {
            product: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount_rate: itemDiscountRate,
            discount: itemDiscount,
            subtotal: itemTotalAfterDiscount,
          };
        });

        // A. Valores del NUEVO producto (ya con descuentos individuales aplicados)
        const newSubtotal = replacementItems.reduce(
          (sum, item) => sum + item.subtotal,
          0,
        );

        // Aplicar descuento global si existe
        const globalDiscountRate = req.body.exchange_discount_rate || 0;
        const globalDiscount = newSubtotal * (globalDiscountRate / 100);
        const subtotalAfterGlobalDiscount = newSubtotal - globalDiscount;

        const newTax = subtotalAfterGlobalDiscount * (taxRate / 100);
        const newTotal = subtotalAfterGlobalDiscount + newTax;

        // B. Valores del CRÉDITO (la devolución que ya calculamos)
        const creditNet = returnData.subtotal;
        const creditTax = returnData.tax;
        const creditTotal = returnData.total;

        // C. Cálculo final (Nuevo - Crédito)
        const finalSubtotal = Math.max(
          0,
          subtotalAfterGlobalDiscount - creditNet,
        );
        const finalTax = Math.max(0, newTax - creditTax);
        const finalTotal = finalSubtotal + finalTax;

        // D. Registro del pago
        const replacementPayments = [];
        if (payment_method && finalTotal > 0) {
          replacementPayments.push({
            method: payment_method,
            amount: finalTotal,
            reference: payment_reference || "Cambio - diferencia",
            status: "CONFIRMED",
          });
        }

        const replacementStatus =
          finalTotal <= 0 || replacementPayments.length > 0
            ? "PAID"
            : "PENDING";

        // Crear la venta de reemplazo
        const replacementSale = await Sale.create({
          client_id: originalSale.client_id,
          employee_id: req.user?._id || req.body.employee_id,
          items: replacementItems,
          subtotal: subtotalAfterGlobalDiscount,
          discount_rate: globalDiscountRate,
          discount: globalDiscount,
          tax_rate: taxRate,
          tax: finalTax,
          total: finalTotal,
          payments: replacementPayments,
          status: replacementStatus,
          metadata: {
            is_replacement: true,
            original_sale_id: original_sale_id,
            return_id: returnData._id,
            credit_applied_net: creditNet,
            credit_applied_tax: creditTax,
            credit_applied_total: creditTotal,
          },
        });

        replacementSaleId = replacementSale._id;

        // Descontar stock solo si está PAID
        if (replacementStatus === "PAID") {
          try {
            const bulkOps = replacementItems.map((item) => ({
              updateOne: {
                filter: { _id: item.product },
                update: { $inc: { stock: -item.quantity } },
              },
            }));
            await Product.bulkWrite(bulkOps);
          } catch (stockError) {
            console.error(
              "Error al actualizar stock de reemplazo:",
              stockError,
            );
          }
        }
      }

      // 3. Reintegrar stock de los productos devueltos
      try {
        const bulkOps = items.map((item) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: item.quantity } },
          },
        }));
        await Product.bulkWrite(bulkOps);
      } catch (stockError) {
        console.error("Error al reintegrar stock:", stockError);
      }

      // 4. Actualizar venta original
      const currentReturnIds = originalSale.return_ids || [];
      
      // Si es devolución pura (RETURN), cancelar la venta original
      const shouldCancelSale = type === "RETURN";
      
      const updateData = {
        return_ids: [...currentReturnIds, returnData._id],
        has_returns: true,
      };
      
      if (shouldCancelSale) {
        updateData.status = "CANCELLED";
        updateData.metadata = {
          ...(originalSale.metadata || {}),
          cancel_reason: `Devolución: ${reason}${reason_custom ? ' - ' + reason_custom : ''}`,
          cancelled_at: new Date().toISOString(),
          return_id: returnData._id
        };
      }
      
      await Sale.patch(original_sale_id, updateData);

      // 5. REGISTRAR EGRESO EN CAJA si el pago original fue en EFECTIVO
      try {
        const openRegister = await CashRegister.findOpenRegister();
        
        if (openRegister) {
          // Popular la venta original para obtener el nombre del método de pago
          const saleWithPaymentMethod = await Sale.model.findById(original_sale_id)
            .populate("payments.method");
          
          if (saleWithPaymentMethod.payments && saleWithPaymentMethod.payments.length > 0) {
            for (const payment of saleWithPaymentMethod.payments) {
              if (payment.status !== "CONFIRMED") continue;
              
              const methodName = payment.method?.name || "";
              const cfPaymentMethod = mapPaymentMethodToCashFlow(methodName);
              
              // Solo registrar egreso si fue en efectivo
              if (cfPaymentMethod === "cash") {
                const refundAmount = shouldCancelSale ? payment.amount : returnData.total;
                
                await CashFlow.create({
                  type: "EXPENSE",
                  amount: refundAmount,
                  paymentMethod: "cash",
                  concept: `${shouldCancelSale ? 'Devolución' : 'Cambio'} - Venta #${(original_sale_id).toString().slice(-8).toUpperCase()}`,
                  sourceType: "RETURN",
                  sourceId: returnData._id,
                  cashRegisterId: openRegister._id,
                  operatorId: req.user?._id || req.body.employee_id,
                  notes: `${reason}${reason_custom ? ' - ' + reason_custom : ''}`
                });
              }
            }
          }
        } else {
          console.warn("⚠️ No hay caja abierta. No se registró el egreso por devolución.");
        }
      } catch (cashFlowError) {
        console.error("Error registrando egreso en caja por devolución:", cashFlowError);
      }

      // 6. Actualizar la devolución con el ID de la venta de reemplazo si existe
      if (replacementSaleId) {
        await Return.patch(returnData._id, {
          replacement_sale_id: replacementSaleId,
        });
      }

      
      const populatedReturn = await Return.findById(returnData._id);

      return res.status(201).json({
        success: true,
        data: populatedReturn,
        message:
          type === "RETURN"
            ? "Devolución procesada exitosamente"
            : "Cambio procesado exitosamente",
      });
    } catch (error) {
      console.error("Error al crear devolución:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};

export default ReturnController;