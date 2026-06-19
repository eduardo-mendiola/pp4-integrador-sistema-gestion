import Sale from "../models/SaleModel.js";
import CashFlow from "../models/CashFlowModel.js";
import Product from "../models/ProductModel.js";

const StatisticsController = {
  // ==========================================
  // DASHBOARD PRINCIPAL
  // ==========================================
  getDashboard: async (req, res) => {
    try {
      const { from, to } = req.query;

      const startDate = from ? new Date(from) : new Date();
      startDate.setHours(0, 0, 0, 0);

      const endDate = to ? new Date(to) : new Date();
      endDate.setHours(23, 59, 59, 999);

      // Calcular período anterior para comparación
      const periodDuration = endDate - startDate;
      const previousStart = new Date(startDate - periodDuration);
      const previousEnd = new Date(startDate - 1); // Un milisegundo antes del inicio actual

      // ==========================================
      // 1. KPIs PRINCIPALES
      // ==========================================
      const currentSales = await Sale.model
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "CANCELLED" },
        })
        .populate("payments.method", "name")
        .populate("items.product", "name sku")
        .lean();

      const previousSales = await Sale.model
        .find({
          createdAt: { $gte: previousStart, $lte: previousEnd },
          status: { $ne: "CANCELLED" },
        })
        .lean();

      const currentTotal = currentSales.reduce(
        (sum, s) => sum + (s.total || 0),
        0,
      );
      const previousTotal = previousSales.reduce(
        (sum, s) => sum + (s.total || 0),
        0,
      );

      const currentCount = currentSales.length;
      const previousCount = previousSales.length;

      const ticketPromedio = currentCount > 0 ? currentTotal / currentCount : 0;
      const previousTicketPromedio =
        previousCount > 0 ? previousTotal / previousCount : 0;

      // Productos vendidos
      let totalUnitsSold = 0;
      const uniqueClients = new Set();

      currentSales.forEach((sale) => {
        if (sale.items) {
          sale.items.forEach((item) => {
            totalUnitsSold += item.quantity || 0;
          });
        }
        if (sale.client_id) {
          uniqueClients.add(sale.client_id.toString());
        }
      });

      // ==========================================
      // 2. EVOLUCIÓN DE VENTAS (por día)
      // ==========================================
      const salesByDay = {};
      const currentDate = new Date(startDate);

      // Inicializar todos los días del rango
      while (currentDate <= endDate) {
        const key = currentDate.toISOString().split("T")[0];
        salesByDay[key] = { date: key, total: 0, count: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Agrupar ventas por día
      currentSales.forEach((sale) => {
        const saleDate = new Date(sale.createdAt);
        const key = saleDate.toISOString().split("T")[0];
        if (salesByDay[key]) {
          salesByDay[key].total += sale.total || 0;
          salesByDay[key].count += 1;
        }
      });

      const evolutionData = Object.values(salesByDay).sort((a, b) =>
        a.date.localeCompare(b.date),
      );

      // ==========================================
      // 3. VENTAS POR MÉTODO DE PAGO
      // ==========================================
      const byPaymentMethod = {};

      currentSales.forEach((sale) => {
        if (sale.payments && sale.payments.length > 0) {
          const method = sale.payments[0].method;
          let methodName = "unknown";

          if (typeof method === "string") {
            methodName = method;
          } else if (method?.name) {
            // Mapear nombres de la base de datos a etiquetas amigables
            const name = method.name.toLowerCase();
            if (name.includes("cash") || name.includes("efectivo"))
              methodName = "cash";
            else if (name.includes("crédito") || name.includes("credito"))
              methodName = "credit_card";
            else if (name.includes("débito") || name.includes("debito"))
              methodName = "debit_card";
            else if (
              name.includes("transfer") ||
              name.includes("transferencia")
            )
              methodName = "transfer";
            else methodName = method.name;
          }

          if (!byPaymentMethod[methodName]) {
            byPaymentMethod[methodName] = { count: 0, total: 0 };
          }
          byPaymentMethod[methodName].count += 1;
          byPaymentMethod[methodName].total += sale.total || 0;
        }
      });

      // ==========================================
      // 4. TOP 10 PRODUCTOS
      // ==========================================
      const productMap = {};

      currentSales.forEach((sale) => {
        if (!sale.items) return;
        sale.items.forEach((item) => {
          const productId = item.productId || item.product?._id || item.product;
          if (!productId) return;

          if (!productMap[productId]) {
            productMap[productId] = {
              productId,
              name: item.product?.name || item.name || "Producto",
              sku: item.product?.sku || item.sku || "",
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }

          productMap[productId].totalQuantity += item.quantity || 0;
          productMap[productId].totalRevenue +=
            (item.price || 0) * (item.quantity || 0);
        });
      });

      const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10)
        .map((p, index) => ({ ...p, rank: index + 1 }));

      // ==========================================
      // 5. VENTAS POR HORA DEL DÍA
      // ==========================================
      const salesByHour = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        label: `${i.toString().padStart(2, "0")}:00`,
        count: 0,
        total: 0,
      }));

      currentSales.forEach((sale) => {
        const hour = new Date(sale.createdAt).getHours();
        salesByHour[hour].count += 1;
        salesByHour[hour].total += sale.total || 0;
      });

      // ==========================================
      // 6. ESTADO DE VENTAS
      // ==========================================
      const allSalesInPeriod = await Sale.model
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .populate("payments.method", "name")
        .lean();

      const byStatus = {};
      allSalesInPeriod.forEach((sale) => {
        const status = sale.status || "UNKNOWN";
        if (!byStatus[status]) {
          byStatus[status] = { count: 0, total: 0 };
        }
        byStatus[status].count += 1;
        byStatus[status].total += sale.total || 0;
      });

      // ==========================================
      // 7. VENTAS POR CATEGORÍA
      // ==========================================
      const byCategory = {};

      for (const sale of currentSales) {
        if (!sale.items) continue;

        for (const item of sale.items) {
          const productId = item.productId || item.product?._id || item.product;
          if (!productId) continue;

          try {
            const product = await Product.model
              .findById(productId)
              .populate("category", "name")
              .lean();
            const categoryName = product?.category?.name || "Sin categoría";

            if (!byCategory[categoryName]) {
              byCategory[categoryName] = { count: 0, total: 0 };
            }
            byCategory[categoryName].count += item.quantity || 0;
            byCategory[categoryName].total +=
              (item.price || 0) * (item.quantity || 0);
          } catch (err) {
            // Ignorar errores de productos no encontrados
          }
        }
      }

      // ==========================================
      // RESPUESTA FINAL
      // ==========================================
      const calculateVariation = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return res.json({
        success: true,
        data: {
          period: {
            from: startDate,
            to: endDate,
            previousFrom: previousStart,
            previousTo: previousEnd,
          },
          kpis: {
            totalRevenue: {
              current: currentTotal,
              previous: previousTotal,
              variation: calculateVariation(currentTotal, previousTotal),
            },
            salesCount: {
              current: currentCount,
              previous: previousCount,
              variation: calculateVariation(currentCount, previousCount),
            },
            averageTicket: {
              current: ticketPromedio,
              previous: previousTicketPromedio,
              variation: calculateVariation(
                ticketPromedio,
                previousTicketPromedio,
              ),
            },
            unitsSold: {
              current: totalUnitsSold,
            },
            uniqueClients: {
              current: uniqueClients.size,
            },
          },
          evolution: evolutionData,
          byPaymentMethod,
          topProducts,
          byHour: salesByHour,
          byStatus,
          byCategory,
        },
      });
    } catch (error) {
      console.error("Error en estadísticas:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default StatisticsController;
