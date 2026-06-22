import CashFlow from "../models/CashFlowModel.js";
import CashRegister from "../models/CashRegisterModel.js";
import Sale from "../models/SaleModel.js";
import Return from "../models/ReturnModel.js";

const ReportController = {
  // ==========================================
  // REPORTE 1: CIERRE DE CAJA
  // ==========================================
  getCashClosing: async (req, res) => {
    try {
      const { from, to } = req.query;
      
      const startDate = from ? new Date(from) : new Date();
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = to ? new Date(to) : new Date();
      endDate.setHours(23, 59, 59, 999);

      // Buscar cajas en el rango
      const registers = await CashRegister.model.find({
        openingDate: { $lte: endDate },
        $or: [
          { closingDate: { $gte: startDate } },
          { closingDate: null }
        ]
      }).lean();

      const reports = [];

      for (const register of registers) {
        const regStart = new Date(register.openingDate) > startDate 
          ? new Date(register.openingDate) 
          : startDate;
        const regEnd = register.closingDate && new Date(register.closingDate) < endDate
          ? new Date(register.closingDate)
          : endDate;

        const movements = await CashFlow.model.find({
          cashRegisterId: register._id,
          date: { $gte: regStart, $lte: regEnd }
        })
          .populate("operatorId", "username first_name last_name")
          .sort({ date: 1 })
          .lean();

        const totalIncomes = movements
          .filter(m => m.type === 'INCOME')
          .reduce((sum, m) => sum + m.amount, 0);
        
        const totalExpenses = movements
          .filter(m => m.type === 'EXPENSE')
          .reduce((sum, m) => sum + m.amount, 0);

        // Desglose por método de pago
        const byPaymentMethod = {};
        movements.forEach(m => {
          if (!byPaymentMethod[m.paymentMethod]) {
            byPaymentMethod[m.paymentMethod] = { incomes: 0, expenses: 0 };
          }
          if (m.type === 'INCOME') {
            byPaymentMethod[m.paymentMethod].incomes += m.amount;
          } else {
            byPaymentMethod[m.paymentMethod].expenses += m.amount;
          }
        });

        // Desglose por origen
        const bySourceType = {};
        movements.forEach(m => {
          if (!bySourceType[m.sourceType]) {
            bySourceType[m.sourceType] = { count: 0, total: 0 };
          }
          bySourceType[m.sourceType].count += 1;
          bySourceType[m.sourceType].total += m.amount;
        });

        reports.push({
          registerId: register._id,
          openingDate: register.openingDate,
          closingDate: register.closingDate,
          initialAmount: register.initialAmount || 0,
          finalAmount: register.finalAmount || 0,
          expectedAmount: (register.initialAmount || 0) + totalIncomes - totalExpenses,
          difference: register.closingDate 
            ? (register.finalAmount || 0) - ((register.initialAmount || 0) + totalIncomes - totalExpenses)
            : null,
          totalIncomes,
          totalExpenses,
          balance: totalIncomes - totalExpenses,
          movementCount: movements.length,
          byPaymentMethod,
          bySourceType,
          movements
        });
      }

      return res.json({ 
        success: true, 
        data: {
          period: { from: startDate, to: endDate },
          registers: reports,
          totals: {
            totalIncomes: reports.reduce((sum, r) => sum + r.totalIncomes, 0),
            totalExpenses: reports.reduce((sum, r) => sum + r.totalExpenses, 0),
            totalBalance: reports.reduce((sum, r) => sum + r.balance, 0),
            registerCount: reports.length
          }
        }
      });
    } catch (error) {
      console.error("Error en reporte de cierre:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================
  // REPORTE 2: VENTAS POR PERÍODO
  // ==========================================
  getSales: async (req, res) => {
    try {
      const { from, to, paymentMethod, clientId } = req.query;
      
      const query = {};
      
      if (from || to) {
        query.createdAt = {};
        if (from) {
          const start = new Date(from);
          start.setHours(0, 0, 0, 0);
          query.createdAt.$gte = start;
        }
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      if (clientId) query.client_id = clientId;
      
      // Filtro por método de pago (dentro del array payments)
      if (paymentMethod) {
        query["payments.method"] = paymentMethod;
      }

      const sales = await Sale.model.find(query)
        .populate("client_id", "first_name last_name business_name document_number")
        .populate("payments.method", "name")
        .sort({ createdAt: -1 })
        .lean();

      // Calcular totales
      const totals = {
        count: sales.length,
        totalAmount: sales.reduce((sum, s) => sum + (s.total || 0), 0),
        totalDiscount: sales.reduce((sum, s) => sum + (s.discount || 0), 0),
        totalTax: sales.reduce((sum, s) => sum + (s.tax || 0), 0),
        byPaymentMethod: {},
        byStatus: {}
      };

      sales.forEach(sale => {
        // Por método de pago
        if (sale.payments && sale.payments.length > 0) {
          const method = sale.payments[0].method;
          const methodName = typeof method === 'string' ? method : method?.name || 'unknown';
          if (!totals.byPaymentMethod[methodName]) {
            totals.byPaymentMethod[methodName] = { count: 0, total: 0 };
          }
          totals.byPaymentMethod[methodName].count += 1;
          totals.byPaymentMethod[methodName].total += sale.total || 0;
        }

        // Por estado
        const status = sale.status || 'UNKNOWN';
        if (!totals.byStatus[status]) {
          totals.byStatus[status] = { count: 0, total: 0 };
        }
        totals.byStatus[status].count += 1;
        totals.byStatus[status].total += sale.total || 0;
      });

      return res.json({ 
        success: true, 
        data: {
          period: { from, to },
          sales,
          totals
        }
      });
    } catch (error) {
      console.error("Error en reporte de ventas:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================
  // REPORTE 3: MOVIMIENTOS DE CAJA
  // ==========================================
  getMovements: async (req, res) => {
    try {
      const { from, to, type, paymentMethod, sourceType } = req.query;
      
      const query = {};
      
      if (type) query.type = type;
      if (paymentMethod) query.paymentMethod = paymentMethod;
      if (sourceType) query.sourceType = sourceType;
      
      if (from || to) {
        query.date = {};
        if (from) {
          const start = new Date(from);
          start.setHours(0, 0, 0, 0);
          query.date.$gte = start;
        }
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }

      const movements = await CashFlow.model.find(query)
        .populate("cashRegisterId", "name")
        .populate("operatorId", "username first_name last_name")
        .sort({ date: -1 })
        .lean();

      const totals = {
        count: movements.length,
        totalIncomes: movements.filter(m => m.type === 'INCOME').reduce((sum, m) => sum + m.amount, 0),
        totalExpenses: movements.filter(m => m.type === 'EXPENSE').reduce((sum, m) => sum + m.amount, 0),
        balance: 0,
        byPaymentMethod: {},
        bySourceType: {}
      };

      totals.balance = totals.totalIncomes - totals.totalExpenses;

      // Desglose por método de pago y por origen
      movements.forEach(m => {
        if (!totals.byPaymentMethod[m.paymentMethod]) {
          totals.byPaymentMethod[m.paymentMethod] = { count: 0, total: 0 };
        }
        totals.byPaymentMethod[m.paymentMethod].count += 1;
        totals.byPaymentMethod[m.paymentMethod].total += m.amount;

        if (!totals.bySourceType[m.sourceType]) {
          totals.bySourceType[m.sourceType] = { count: 0, total: 0 };
        }
        totals.bySourceType[m.sourceType].count += 1;
        totals.bySourceType[m.sourceType].total += m.amount;
      });

      return res.json({ 
        success: true, 
        data: {
          period: { from, to },
          movements,
          totals
        }
      });
    } catch (error) {
      console.error("Error en reporte de movimientos:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================
  // REPORTE 4: PRODUCTOS MÁS VENDIDOS
  // ==========================================
  getTopProducts: async (req, res) => {
    try {
      const { from, to, limit = 20 } = req.query;
      
      const query = {};
      
      if (from || to) {
        query.createdAt = {};
        if (from) {
          const start = new Date(from);
          start.setHours(0, 0, 0, 0);
          query.createdAt.$gte = start;
        }
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      const sales = await Sale.model.find(query)
        .populate("items.product", "name sku")
        .lean();

      // Acumular ventas por producto
      const productMap = {};

      sales.forEach(sale => {
        if (!sale.items) return;
        sale.items.forEach(item => {
          const productId = item.productId || item.product?._id || item.product;
          if (!productId) return;

          if (!productMap[productId]) {
            productMap[productId] = {
              productId,
              name: item.name || item.product?.name || 'Producto',
              sku: item.sku || item.product?.sku || '',
              totalQuantity: 0,
              totalRevenue: 0,
              appearances: 0
            };
          }

          productMap[productId].totalQuantity += item.quantity || 0;
          productMap[productId].totalRevenue += (item.price || 0) * (item.quantity || 0);
          productMap[productId].appearances += 1;
        });
      });

      // Convertir a array y ordenar
      let products = Object.values(productMap);
      
      // Ordenar por cantidad vendida (default) o por ingresos
      products.sort((a, b) => b.totalQuantity - a.totalQuantity);
      
      // Limitar resultados
      products = products.slice(0, parseInt(limit));

      // Agregar ranking
      products = products.map((p, index) => ({
        ...p,
        rank: index + 1
      }));

      const totals = {
        uniqueProducts: products.length,
        totalQuantity: products.reduce((sum, p) => sum + p.totalQuantity, 0),
        totalRevenue: products.reduce((sum, p) => sum + p.totalRevenue, 0)
      };

      return res.json({ 
        success: true, 
        data: {
          period: { from, to },
          products,
          totals
        }
      });
    } catch (error) {
      console.error("Error en reporte de productos:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================
  // REPORTE 5: DEVOLUCIONES
  // ==========================================
  getReturns: async (req, res) => {
    try {
      const { from, to, type, reason } = req.query;
      
      const query = {};
      
      if (type) query.type = type.toUpperCase();
      if (reason) query.reason = reason;
      
      if (from || to) {
        query.createdAt = {};
        if (from) {
          const start = new Date(from);
          start.setHours(0, 0, 0, 0);
          query.createdAt.$gte = start;
        }
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      const returns = await Return.model.find(query)
        .populate("original_sale_id", "total createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const totals = {
        count: returns.length,
        byType: {},
        byReason: {},
        totalRefund: returns.reduce((sum, r) => sum + (r.difference ? Math.abs(r.difference) : 0), 0)
      };

      returns.forEach(r => {
        // Por tipo
        const type = r.type || 'UNKNOWN';
        if (!totals.byType[type]) {
          totals.byType[type] = { count: 0, total: 0 };
        }
        totals.byType[type].count += 1;
        totals.byType[type].total += r.difference ? Math.abs(r.difference) : 0;

        // Por motivo
        const rsn = r.reason || 'SIN_MOTIVO';
        if (!totals.byReason[rsn]) {
          totals.byReason[rsn] = { count: 0, total: 0 };
        }
        totals.byReason[rsn].count += 1;
        totals.byReason[rsn].total += r.difference ? Math.abs(r.difference) : 0;
      });

      return res.json({ 
        success: true, 
        data: {
          period: { from, to },
          returns,
          totals
        }
      });
    } catch (error) {
      console.error("Error en reporte de devoluciones:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default ReportController;