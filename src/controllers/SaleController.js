import Sale from '../models/SaleModel.js';

const normalizeItems = (items) => {
  if (Array.isArray(items)) {
    return items;
  }

  if (typeof items === 'string' && items.trim()) {
    return JSON.parse(items);
  }

  return [];
};

const SaleController = {
  getAll: async (req, res) => {
    try {
      const sales = await Sale.find({})
        .sort({ createdAt: -1 })
        .populate({ path: 'items.product' })
        .populate('created_by', 'username email')
        .lean();

      return res.json({ success: true, data: sales });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id)
        .populate({ path: 'items.product' })
        .populate('created_by', 'username email')
        .lean();

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      return res.json({ success: true, data: sale });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const payload = {
        ...req.body,
        items: normalizeItems(req.body.items),
        created_by: req.user?._id || req.body.created_by
      };

      const sale = await Sale.create(payload);
      return res.status(201).json({ success: true, data: sale });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const payload = { ...req.body };
      if (payload.items !== undefined) {
        payload.items = normalizeItems(payload.items);
      }

      const sale = await Sale.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
      }).lean();

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      return res.json({ success: true, data: sale });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Sale.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }
      return res.json({ success: true, message: 'Venta eliminada' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default SaleController;