import Promotion from "../models/PromotionModel.js";

const PromotionController = {
  create: async (req, res) => {
    try {
      const promotion = await Promotion.create(req.body);
      res.status(201).json(promotion);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  getAll: async (_, res) => {
    try {
      res.json(await Promotion.find().populate("productId discountRuleId"));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  getById: async (req, res) => {
    try {
      const promotion = await Promotion.findById(req.params.id).populate("productId discountRuleId");
      if (!promotion) return res.status(404).json({ message: "Not found" });
      res.json(promotion);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!promotion) return res.status(404).json({ message: "Not found" });
      res.json(promotion);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  remove: async (req, res) => {
    try {
      const promotion = await Promotion.findByIdAndDelete(req.params.id);
      if (!promotion) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
};

export default PromotionController;