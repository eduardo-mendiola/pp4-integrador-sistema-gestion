import Promotion from "../models/PromotionModel.js";
import Sale from "../models/SaleModel.js";

const PromotionService = {
  /**
   * Calcula el descuento automático para un producto basado en promociones activas
   * y el tiempo que lleva sin venderse
   * 
   * @param {string} productId - ID del producto
   * @param {Date} currentDate - Fecha actual (default: hoy)
   * @returns {Object} - { discountRate, discountRule, promotion } o null si no hay descuento
   */
  calculateAutomaticDiscount: async (productId, currentDate = new Date()) => {
    try {
      // 1. Buscar promociones activas para este producto en la fecha actual
      const activePromotions = await Promotion.findActiveByProductAndDate(productId, currentDate);
      
      if (!activePromotions || activePromotions.length === 0) {
        return null; // No hay promociones activas
      }

      // 2. Obtener la última fecha de venta de este producto
      const lastSaleDate = await PromotionService.getLastSaleDate(productId);
      
      // 3. Calcular meses sin venta
      const monthsWithoutSale = PromotionService.calculateMonthsWithoutSale(lastSaleDate, currentDate);

      // 4. Evaluar todas las promociones y sus reglas para encontrar el mejor descuento
      let bestDiscount = null;

      for (const promotion of activePromotions) {
        if (!promotion.discountRuleIds || promotion.discountRuleIds.length === 0) {
          continue;
        }

        // Ordenar reglas por timeWithoutSaleMonths ascendente
        const sortedRules = [...promotion.discountRuleIds].sort(
          (a, b) => a.timeWithoutSaleMonths - b.timeWithoutSaleMonths
        );

        // Encontrar la regla que aplica según el tiempo sin venta
        let applicableRule = null;
        for (const rule of sortedRules) {
          if (monthsWithoutSale >= rule.timeWithoutSaleMonths) {
            applicableRule = rule;
          }
        }

        // Si encontramos una regla aplicable y es mejor que la actual, la guardamos
        if (applicableRule) {
          if (!bestDiscount || applicableRule.percentage > bestDiscount.discountRule.percentage) {
            bestDiscount = {
              discountRate: applicableRule.percentage,
              discountRule: applicableRule,
              promotion: promotion,
              monthsWithoutSale: monthsWithoutSale
            };
          }
        }
      }

      return bestDiscount;
    } catch (error) {
      console.error("Error calculando descuento automático:", error);
      return null;
    }
  },

  /**
   * Obtiene la fecha de la última venta de un producto
   */
  getLastSaleDate: async (productId) => {
    try {
      const lastSale = await Sale.model.findOne({
        'items.product': productId,
        status: 'PAID'
      })
      .sort({ createdAt: -1 })
      .lean();

      return lastSale?.createdAt || null;
    } catch (error) {
      console.error("Error obteniendo última fecha de venta:", error);
      return null;
    }
  },

  /**
   * Calcula cuántos meses han pasado desde la última venta
   */
  calculateMonthsWithoutSale: (lastSaleDate, currentDate) => {
    if (!lastSaleDate) {
      // Si nunca se vendió, asumimos que tiene mucho tiempo (ej: 12 meses)
      return 12;
    }

    const diffTime = currentDate - lastSaleDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffMonths = Math.floor(diffDays / 30);
    
    return diffMonths;
  }
};

export default PromotionService;