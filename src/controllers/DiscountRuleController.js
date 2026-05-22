import DiscountRule from "../models/DiscountRule.js";

const DiscountRuleController = {
  create: async (req, res) => {
    try {
      const rule = await DiscountRule.create(req.body);
      res.status(201).json(rule);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  getAll: async (_, res) => {
    try {
      res.json(await DiscountRule.find());
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  getById: async (req, res) => {
    try {
      const rule = await DiscountRule.findById(req.params.id);
      if (!rule) return res.status(404).json({ message: "Not found" });
      res.json(rule);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const rule = await DiscountRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!rule) return res.status(404).json({ message: "Not found" });
      res.json(rule);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      const rule = await DiscountRule.findByIdAndDelete(req.params.id);
      if (!rule) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
};

export default DiscountRuleController;