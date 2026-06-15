import Promotion from "../models/PromotionModel.js";
import Product from "../models/ProductModel.js";

const AGE_RANGES = {
  "0-2": { min: 0, max: 2 },
  "3-5": { min: 3, max: 5 },
  "6-8": { min: 6, max: 8 },
  "9-12": { min: 9, max: 12 },
  "13+": { min: 13, max: 999 }
};

const PromotionService = {
  calculateAutomaticDiscount: async (productId, currentDate = new Date()) => {
    try {
      // ✅ NUEVO: Obtener todas las promociones activas en la fecha (sin filtro de producto)
      const activePromotions = await Promotion.findActiveByDate(currentDate);
      if (!activePromotions || activePromotions.length === 0) return null;

      const product = await Product.model.findById(productId).populate('supplier').lean();
      if (!product) return null;

      const metrics = PromotionService.calculateProductMetrics(product, currentDate);
      let bestDiscount = null;

      for (const promotion of activePromotions) {
        if (!promotion.discountRuleIds || promotion.discountRuleIds.length === 0) continue;

        for (const rule of promotion.discountRuleIds) {
          const evaluation = PromotionService.evaluateRule(rule, product, metrics);
          
          if (evaluation.applies) {
            if (!bestDiscount || rule.percentage > bestDiscount.discountRule.percentage) {
              bestDiscount = {
                discountRate: rule.percentage,
                discountRule: rule,
                promotion: promotion,
                matchedConditions: evaluation.matchedConditions,
                metrics: metrics
              };
            }
          }
        }
      }

      return bestDiscount;
    } catch (error) {
      console.error("Error calculando descuento automático:", error);
      return null;
    }
  },

  calculateProductMetrics: (product, currentDate) => {
    const metrics = {
      stock: product.stock || 0,
      daysInStock: 0,
      monthsInStock: 0,
      monthsWithoutSale: 0,
      brand: product.brand || '',
      supplierId: product.supplier?._id?.toString() || product.supplier?.toString() || '',
      ageRange: product.age_range || '',
      productId: product._id.toString()
    };

    if (product.created_at) {
      const createdAt = new Date(product.created_at);
      const diffTime = currentDate - createdAt;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      metrics.daysInStock = Math.floor(diffDays);
      metrics.monthsInStock = Math.floor(diffDays / 30);
    }

    if (product.lastSaleDate) {
      const lastSale = new Date(product.lastSaleDate);
      const diffTime = currentDate - lastSale;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      metrics.monthsWithoutSale = Math.floor(diffDays / 30);
    } else {
      metrics.monthsWithoutSale = 12;
    }

    return metrics;
  },

  evaluateRule: (rule, product, metrics) => {
    const conditions = rule.conditions || {};
    const matchedConditions = [];
    let allConditionsMet = true;

    // Filtros de identidad
    if (conditions.productIds && conditions.productIds.length > 0) {
      const productIdsStr = conditions.productIds.map(id => id.toString());
      if (productIdsStr.includes(metrics.productId)) {
        matchedConditions.push(`Producto específico`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.brands && conditions.brands.length > 0) {
      const productBrand = (metrics.brand || '').toLowerCase().trim();
      const matchesBrand = conditions.brands.some(b => b.toLowerCase().trim() === productBrand);
      if (matchesBrand) {
        matchedConditions.push(`Marca: ${metrics.brand}`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.supplierIds && conditions.supplierIds.length > 0) {
      const supplierIdsStr = conditions.supplierIds.map(id => id.toString());
      if (supplierIdsStr.includes(metrics.supplierId)) {
        matchedConditions.push(`Proveedor específico`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.ageRanges && conditions.ageRanges.length > 0) {
      const productAge = parseInt(metrics.ageRange) || 0;
      const matchesAge = conditions.ageRanges.some(rangeKey => {
        const range = AGE_RANGES[rangeKey];
        return range && productAge >= range.min && productAge <= range.max;
      });
      if (matchesAge) {
        matchedConditions.push(`Edad: ${metrics.ageRange || 'No definida'} años`);
      } else {
        allConditionsMet = false;
      }
    }

    // Filtros de estado
    if (conditions.minMonthsWithoutSale != null) {
      if (metrics.monthsWithoutSale >= conditions.minMonthsWithoutSale) {
        matchedConditions.push(`Sin venta: ≥${conditions.minMonthsWithoutSale} meses`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.maxMonthsWithoutSale != null) {
      if (metrics.monthsWithoutSale <= conditions.maxMonthsWithoutSale) {
        matchedConditions.push(`Sin venta: ≤${conditions.maxMonthsWithoutSale} meses`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.minStockQuantity != null) {
      if (metrics.stock >= conditions.minStockQuantity) {
        matchedConditions.push(`Stock: ≥${conditions.minStockQuantity} uds`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.maxStockQuantity != null) {
      if (metrics.stock <= conditions.maxStockQuantity) {
        matchedConditions.push(`Stock: ≤${conditions.maxStockQuantity} uds`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.minMonthsInStock != null) {
      if (metrics.monthsInStock >= conditions.minMonthsInStock) {
        matchedConditions.push(`En stock: ≥${conditions.minMonthsInStock} meses`);
      } else {
        allConditionsMet = false;
      }
    }

    if (conditions.maxMonthsInStock != null) {
      if (metrics.monthsInStock <= conditions.maxMonthsInStock) {
        matchedConditions.push(`En stock: ≤${conditions.maxMonthsInStock} meses`);
      } else {
        allConditionsMet = false;
      }
    }

    const hasAnyCondition = Object.values(conditions).some(v => {
      if (Array.isArray(v)) return v.length > 0;
      return v != null;
    });
    
    if (!hasAnyCondition) {
      return { applies: false, matchedConditions: [] };
    }

    return { applies: allConditionsMet, matchedConditions };
  }
};

export default PromotionService;