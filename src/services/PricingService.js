const PricingService = {
  calculateFinalPrice: (basePrice, promotion, lastSaleDate) => {
    if (!promotion) return basePrice;

    const rule = promotion.discountRuleId;

    const monthsWithoutSale =
      (new Date() - new Date(lastSaleDate)) / (1000 * 60 * 60 * 24 * 30); // Convert milliseconds to months

    const ruleApplies = monthsWithoutSale >= rule.timeWithoutSaleMonths;

    const discount = ruleApplies ? rule.percentage : 0;

    return basePrice - (basePrice * discount) / 100;
  }
};

export default PricingService;